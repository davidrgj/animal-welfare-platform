import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const user = auth.currentUser ?? await auth.restore();
  return user ? true : router.parseUrl('/login');
};

export const guestGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const user = auth.currentUser ?? await auth.restore();
  return user ? router.parseUrl('/app/dashboard') : true;
};

export const adminGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const user = auth.currentUser ?? await auth.restore();
  if (!user) return router.parseUrl('/login');
  return user.role === 'ADMINISTRATOR' ? true : router.parseUrl('/app/profile');
};
