import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonBackButton, IonButton, IonButtons, IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { ROLE_LABEL } from '../core/labels';
import { Profile } from '../core/models';
import { StoreService } from '../core/store.service';
import { EmptyStateComponent } from '../shared/empty-state.component';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [DatePipe, RouterLink, IonBackButton, IonButton, IonButtons, IonContent, IonHeader, IonTitle, IonToolbar, EmptyStateComponent],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/app/profile" text="Atrás"></ion-back-button>
        </ion-buttons>
        <ion-title>Usuarios</ion-title>
        <ion-button slot="end" fill="clear" routerLink="/app/users/new">Nuevo</ion-button>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <div class="page-body stack">
        <section class="hero-card hero-ink">
          <p class="page-kicker">Administración</p>
          <h1 class="display section-title">{{ users.length }} usuarios</h1>
          <p class="status-meta">Roles, documentos y acceso al sistema</p>
        </section>
        @if (users.length === 0) {
          <app-empty-state icon="person-outline" title="Sin usuarios" hint="Crea el primer usuario o espera registros públicos." />
        } @else {
          <div class="stack">
            @for (user of users; track user.id) {
              <a class="animal-row list-card" [routerLink]="['/app/users', user.id]">
                <span class="species-mark species-mark-sim">{{ user.fullName.charAt(0) }}</span>
                <div class="list-card-copy">
                  <strong>{{ user.fullName }}</strong>
                  <p class="muted">{{ user.email }}</p>
                  <p class="muted">{{ user.documentId }} · {{ user.createdAt | date:'d MMM, y' }}</p>
                </div>
                <span class="tag">{{ roles[user.role] }}</span>
              </a>
            }
          </div>
        }
      </div>
    </ion-content>
  `
})
export class UsersPage implements OnInit {
  users: Profile[] = [];
  readonly roles = ROLE_LABEL;

  constructor(private readonly store: StoreService) {}

  async ngOnInit(): Promise<void> {
    this.users = await this.store.users();
  }
}
