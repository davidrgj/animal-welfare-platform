import { Component, ViewChild } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { IonButton, IonButtons, IonContent, IonIcon, IonItem, IonLabel, IonList, IonPopover } from '@ionic/angular/standalone';
import { AuthService } from '../core/auth.service';
import { ROLE_LABEL } from '../core/labels';

let accountMenuSerial = 0;

@Component({
  selector: 'app-account-menu',
  standalone: true,
  imports: [RouterLink, IonButton, IonButtons, IonContent, IonIcon, IonItem, IonLabel, IonList, IonPopover],
  host: { slot: 'end', class: 'account-menu-host' },
  template: `
    <ion-buttons>
      <ion-button [id]="triggerId" fill="clear" class="account-trigger" aria-haspopup="menu" [attr.aria-label]="'Menú de ' + firstName">
        <span class="account-chip">
          <span class="account-avatar" aria-hidden="true">{{ initials }}</span>
          <span class="account-meta">
            <strong>{{ firstName }}</strong>
            <small>{{ roleLabel }}</small>
          </span>
          <ion-icon name="chevron-down-outline" aria-hidden="true"></ion-icon>
        </span>
      </ion-button>
    </ion-buttons>

    <ion-popover #popover [trigger]="triggerId" side="bottom" alignment="end" [dismissOnSelect]="true" cssClass="account-popover">
      <ng-template>
        <ion-content class="account-popover-content">
          <div class="account-popover-head">
            <span class="account-avatar account-avatar-lg" aria-hidden="true">{{ initials }}</span>
            <div>
              <strong>{{ user.fullName }}</strong>
              <p>{{ user.email }}</p>
              <span class="tag">{{ roleLabel }}</span>
            </div>
          </div>
          <ion-list lines="none">
            <ion-item button detail="false" routerLink="/app/profile" (click)="close()">
              <ion-icon slot="start" name="person-outline" aria-hidden="true"></ion-icon>
              <ion-label>Mi cuenta</ion-label>
            </ion-item>
            <ion-item button detail="false" routerLink="/app/reports" (click)="close()">
              <ion-icon slot="start" name="document-text-outline" aria-hidden="true"></ion-icon>
              <ion-label>Reportes de predio</ion-label>
            </ion-item>
            @if (user.role === 'ADMINISTRATOR') {
              <ion-item button detail="false" routerLink="/app/users" (click)="close()">
                <ion-icon slot="start" name="people-outline" aria-hidden="true"></ion-icon>
                <ion-label>Usuarios y roles</ion-label>
              </ion-item>
            }
            <ion-item button detail="false" class="account-logout" (click)="logout()">
              <ion-icon slot="start" name="log-out-outline" aria-hidden="true"></ion-icon>
              <ion-label>Cerrar sesión</ion-label>
            </ion-item>
          </ion-list>
        </ion-content>
      </ng-template>
    </ion-popover>
  `,
  styles: [`
    :host {
      display: block;
      margin-inline-end: 4px;
    }
  `]
})
export class AccountMenuComponent {
  @ViewChild('popover') popover?: IonPopover;
  readonly triggerId = `account-menu-${++accountMenuSerial}`;
  readonly user;
  readonly roleLabel: string;
  readonly firstName: string;
  readonly initials: string;

  constructor(private readonly auth: AuthService, private readonly router: Router) {
    this.user = auth.requireUser();
    this.roleLabel = ROLE_LABEL[this.user.role];
    this.firstName = this.user.fullName.split(' ')[0];
    this.initials = this.user.fullName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('');
  }

  async close(): Promise<void> {
    await this.popover?.dismiss();
  }

  async logout(): Promise<void> {
    await this.close();
    await this.auth.logout();
  }
}
