import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IonButton, IonContent, IonInput, IonItem, IonList } from '@ionic/angular/standalone';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink, IonButton, IonContent, IonInput, IonItem, IonList],
  template: `
    <ion-content [fullscreen]="true">
      <div class="auth-screen">
        <div class="auth-form-wrap">
          <img class="hero-mark" src="assets/mark.svg" alt="" />
          <h1 class="display auth-title">Bienestar ICA</h1>
          <p class="page-lead">Monitoreo y simulación del bienestar animal.</p>
          <form class="auth-panel stack" (ngSubmit)="submit()">
            <ion-list [inset]="true">
              <ion-item>
                <ion-input label="Correo electrónico" labelPlacement="stacked" type="email" [(ngModel)]="email" name="email" required></ion-input>
              </ion-item>
              <ion-item>
                <ion-input label="Contraseña" labelPlacement="stacked" type="password" [(ngModel)]="password" name="password" required></ion-input>
              </ion-item>
            </ion-list>
            @if (error) { <p class="error-text">{{ error }}</p> }
            <ion-button expand="block" type="submit">Entrar</ion-button>
            <a class="auth-link" routerLink="/register">Crear cuenta</a>
            <p class="muted">Demo: producer&#64;farm.local / Producer123!</p>
          </form>
        </div>
      </div>
    </ion-content>
  `
})
export class LoginPage {
  email = 'producer@farm.local';
  password = 'Producer123!';
  error = '';

  constructor(private readonly auth: AuthService, private readonly router: Router) {}

  async submit(): Promise<void> {
    this.error = '';
    try {
      await this.auth.login(this.email, this.password);
      await this.router.navigateByUrl('/app/dashboard');
    } catch {
      this.error = 'Correo o contraseña no válidos.';
    }
  }
}
