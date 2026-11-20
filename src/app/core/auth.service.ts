import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Profile, UserRole } from './models';
import { hashSecret, newId, nowIso } from './crypto';
import { loadProfile } from './cloud.repository';
import { database, ensureSeed } from './database';
import { authEmailRedirectTo, isCloud, supabase } from './supabase.client';

const SESSION_KEY = 'animal-welfare-session';

@Injectable({ providedIn: 'root' })
export class AuthService {
  currentUser: Profile | null = null;
  private sessionCleared = false;

  constructor(private readonly router: Router) {}

  async restore(): Promise<Profile | null> {
    if (this.sessionCleared) {
      this.currentUser = null;
      return null;
    }
    if (isCloud()) {
      const { data } = await supabase().auth.getSession();
      const id = data.session?.user.id;
      if (!id) {
        this.currentUser = null;
        return null;
      }
      try {
        this.currentUser = await loadProfile(id);
      } catch {
        await supabase().auth.signOut();
        this.currentUser = null;
      }
      if (this.sessionCleared) {
        this.currentUser = null;
        return null;
      }
      return this.currentUser;
    }
    await ensureSeed();
    if (this.sessionCleared) {
      this.currentUser = null;
      return null;
    }
    const id = localStorage.getItem(SESSION_KEY);
    this.currentUser = id ? (await database.profiles.get(id)) ?? null : null;
    return this.currentUser;
  }

  requireUser(): Profile {
    if (!this.currentUser) throw new Error('Authentication required');
    return this.currentUser;
  }

  async login(email: string, password: string): Promise<Profile> {
    if (isCloud()) {
      const { data, error } = await supabase().auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
      if (error || !data.user) throw new Error('Invalid credentials');
      const user = await loadProfile(data.user.id);
      this.sessionCleared = false;
      this.currentUser = user;
      return user;
    }
    await ensureSeed();
    const users = await database.profiles.toArray();
    const user = users.find((profile) => profile.email.toLowerCase() === email.trim().toLowerCase());
    if (!user || !user.passwordHash || user.passwordHash !== await hashSecret(password)) {
      throw new Error('Invalid credentials');
    }
    this.persist(user);
    return user;
  }

  async register(input: { fullName: string; email: string; password: string; documentId: string; phone: string; role: UserRole }): Promise<Profile> {
    const email = input.email.trim().toLowerCase();
    if (isCloud()) {
      const { data, error } = await supabase().auth.signUp({
        email,
        password: input.password,
        options: {
          emailRedirectTo: authEmailRedirectTo(),
          data: {
            full_name: input.fullName.trim(),
            document_id: input.documentId.trim(),
            phone: input.phone.trim(),
            role: input.role
          }
        }
      });
      if (error) throw error;
      if (!data.user) throw new Error('User was not created');

      // If Confirm email is still on in Supabase, signUp has no session: sign in right away
      // (works once emails are auto-confirmed / Confirm email is disabled).
      if (!data.session) {
        const { data: signedIn, error: signInError } = await supabase().auth.signInWithPassword({
          email,
          password: input.password
        });
        if (signInError || !signedIn.user) {
          throw new Error('EMAIL_CONFIRM_BLOCKED');
        }
      }

      const profile = await loadProfile(data.user.id);
      this.sessionCleared = false;
      this.currentUser = profile;
      return profile;
    }
    await ensureSeed();
    const users = await database.profiles.toArray();
    const existing = users.find((profile) => profile.email.toLowerCase() === email);
    if (existing) throw new Error('Email is already registered');
    const user: Profile = {
      id: newId(),
      fullName: input.fullName.trim(),
      email,
      passwordHash: await hashSecret(input.password),
      documentId: input.documentId.trim(),
      phone: input.phone.trim(),
      role: input.role,
      createdAt: nowIso()
    };
    await database.profiles.add(user);
    this.persist(user);
    return user;
  }

  async logout(): Promise<void> {
    this.sessionCleared = true;
    this.currentUser = null;
    localStorage.removeItem(SESSION_KEY);
    try {
      if (isCloud()) await supabase().auth.signOut();
    } finally {
      await this.router.navigateByUrl('/login');
    }
  }

  private persist(user: Profile): void {
    this.sessionCleared = false;
    this.currentUser = user;
    localStorage.setItem(SESSION_KEY, user.id);
  }
}
