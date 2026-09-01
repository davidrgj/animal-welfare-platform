import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Profile, UserRole } from './models';
import { hashSecret, newId, nowIso } from './crypto';
import { database, ensureSeed } from './database';

const SESSION_KEY = 'animal-welfare-session';

@Injectable({ providedIn: 'root' })
export class AuthService {
  currentUser: Profile | null = null;

  constructor(private readonly router: Router) {}

  async restore(): Promise<Profile | null> {
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
    await ensureSeed();
    const users = await database.profiles.toArray();
    const user = users.find((profile) => profile.email.toLowerCase() === email.trim().toLowerCase());
    if (!user || user.passwordHash !== await hashSecret(password)) {
      throw new Error('Invalid credentials');
    }
    this.persist(user);
    return user;
  }

  async register(input: { fullName: string; email: string; password: string; documentId: string; phone: string; role: UserRole }): Promise<Profile> {
    await ensureSeed();
    const email = input.email.trim().toLowerCase();
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
    void this.router.navigateByUrl('/login');
  }

  private persist(user: Profile): void {
    this.currentUser = user;
    localStorage.setItem(SESSION_KEY, user.id);
  }
}
