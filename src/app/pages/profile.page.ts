import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonButton, IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { AuthService } from '../core/auth.service';
import { ROLE_LABEL } from '../core/labels';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [DatePipe, RouterLink, IonButton, IonContent, IonHeader, IonTitle, IonToolbar],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Cuenta</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <div class="page-body stack">
        <section class="panel">
          <p class="page-kicker">{{ role[user.role] }}</p>
          <h1 class="display" style="margin:0">{{ user.fullName }}</h1>
          <p class="muted">{{ user.email }}</p>
          <p class="muted">Documento {{ user.documentId }}</p>
          <p class="muted">Alta {{ user.createdAt | date:'d MMM, y hh:mm a' }}</p>
        </section>
        <ion-button expand="block" fill="outline" routerLink="/app/reports">Reportes de predio</ion-button>
        <ion-button expand="block" color="danger" (click)="auth.logout()">Cerrar sesión</ion-button>
      </div>
    </ion-content>
  `
})
export class ProfilePage {
  readonly role = ROLE_LABEL;
  readonly user;

  constructor(readonly auth: AuthService) {
    this.user = auth.requireUser();
  }
}
