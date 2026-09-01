import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Profile, UserRole } from './models';
import { hashSecret, newId, nowIso } from './crypto';
import { loadProfile } from './cloud.repository';
import { database, ensureSeed } from './database';
import { isCloud, supabase } from './supabase.client';

const SESSION_KEY = 'animal-welfare-session';

@Injectable({ providedIn: 'root' })
export class AuthService {
  currentUser: Profile | null = null;

  constructor(private readonly router: Router) {}

  async restore(): Promise<Profile | null> {
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
      return this.currentUser;
    }
    await ensureSeed();
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
          data: {
            full_name: input.fullName.trim(),
            document_id: input.documentId.trim(),
            phone: input.phone.trim(),
            role: input.role
          }
        }
      });
      if (error) throw error;
      if (!data.session || !data.user) throw new Error('Confirm email is enabled');
      const user = await loadProfile(data.user.id);
      this.currentUser = user;
      return user;
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

  logout(): void {
    this.currentUser = null;
    localStorage.removeItem(SESSION_KEY);
    if (isCloud()) void supabase().auth.signOut();
    void this.router.navigateByUrl('/login');
  }

  private persist(user: Profile): void {
    this.currentUser = user;
    localStorage.setItem(SESSION_KEY, user.id);
  }
}
