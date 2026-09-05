import { Routes } from '@angular/router';
import { adminGuard, authGuard, guestGuard } from './core/auth.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: 'login', canActivate: [guestGuard], loadComponent: () => import('./pages/login.page').then((module) => module.LoginPage) },
  { path: 'register', canActivate: [guestGuard], loadComponent: () => import('./pages/register.page').then((module) => module.RegisterPage) },
  {
    path: 'app',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/shell.page').then((module) => module.ShellPage),
    children: [
      { path: 'dashboard', loadComponent: () => import('./pages/dashboard.page').then((module) => module.DashboardPage) },
      { path: 'farms', loadComponent: () => import('./pages/farms.page').then((module) => module.FarmsPage) },
      { path: 'farms/new', loadComponent: () => import('./pages/farm-form.page').then((module) => module.FarmFormPage) },
      { path: 'farms/:id', loadComponent: () => import('./pages/farm-form.page').then((module) => module.FarmFormPage) },
      { path: 'animals', loadComponent: () => import('./pages/animals.page').then((module) => module.AnimalsPage) },
      { path: 'animals/new', loadComponent: () => import('./pages/animal-form.page').then((module) => module.AnimalFormPage) },
      { path: 'animals/:id', loadComponent: () => import('./pages/animal-detail.page').then((module) => module.AnimalDetailPage) },
      { path: 'animals/:id/edit', loadComponent: () => import('./pages/animal-form.page').then((module) => module.AnimalFormPage) },
      { path: 'animals/:id/welfare', loadComponent: () => import('./pages/welfare-form.page').then((module) => module.WelfareFormPage) },
      { path: 'simulation', loadComponent: () => import('./pages/simulation.page').then((module) => module.SimulationPage) },
      { path: 'simulation/:id', loadComponent: () => import('./pages/simulation-detail.page').then((module) => module.SimulationDetailPage) },
      { path: 'reports', loadComponent: () => import('./pages/reports.page').then((module) => module.ReportsPage) },
      { path: 'users', canActivate: [adminGuard], loadComponent: () => import('./pages/users.page').then((module) => module.UsersPage) },
      { path: 'users/new', canActivate: [adminGuard], loadComponent: () => import('./pages/user-form.page').then((module) => module.UserFormPage) },
      { path: 'users/:id', canActivate: [adminGuard], loadComponent: () => import('./pages/user-form.page').then((module) => module.UserFormPage) },
      { path: 'profile', loadComponent: () => import('./pages/profile.page').then((module) => module.ProfilePage) },
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' }
    ]
  },
  { path: '**', redirectTo: 'login' }
];
