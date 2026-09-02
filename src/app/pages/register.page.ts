import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IonButton, IonContent, IonInput, IonItem, IonList, IonSelect, IonSelectOption } from '@ionic/angular/standalone';
import { AuthService } from '../core/auth.service';
import { UserRole } from '../core/models';
import { OPTIONS } from '../core/labels';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink, IonButton, IonContent, IonInput, IonItem, IonList, IonSelect, IonSelectOption],
  template: `
    <ion-content [fullscreen]="true">
      <div class="auth-screen">
        <div class="auth-form-wrap">
          <h1 class="display auth-title">Crear cuenta</h1>
          <p class="page-lead">Crea una cuenta para registrar predios, animales y evaluaciones ICA.</p>
          <form class="auth-panel stack" (ngSubmit)="submit()">
            <ion-list [inset]="true">
              <ion-item><ion-input label="Nombre completo" labelPlacement="stacked" [(ngModel)]="fullName" name="fullName" required></ion-input></ion-item>
              <ion-item><ion-input label="Correo electrónico" labelPlacement="stacked" type="email" [(ngModel)]="email" name="email" required></ion-input></ion-item>
              <ion-item><ion-input label="Contraseña" labelPlacement="stacked" type="password" [(ngModel)]="password" name="password" required></ion-input></ion-item>
              <ion-item><ion-input label="Cédula o tarjeta profesional" labelPlacement="stacked" [(ngModel)]="documentId" name="documentId" required></ion-input></ion-item>
              <ion-item><ion-input label="Teléfono" labelPlacement="stacked" [(ngModel)]="phone" name="phone"></ion-input></ion-item>
              <ion-item>
                <ion-select label="Rol" labelPlacement="stacked" [(ngModel)]="role" name="role">
                  @for (option of roles; track option[0]) {
                    <ion-select-option [value]="option[0]">{{ option[1] }}</ion-select-option>
                  }
                </ion-select>
              </ion-item>
            </ion-list>
            @if (error) { <p class="error-text">{{ error }}</p> }
            <ion-button expand="block" type="submit">Registrarme</ion-button>
            <a class="auth-link" routerLink="/login">Ya tengo cuenta</a>
          </form>
        </div>
      </div>
    </ion-content>
  `
})
export class RegisterPage {
  fullName = '';
  email = '';
  password = '';
  documentId = '';
  phone = '';
  role: UserRole = 'PRODUCER';
  error = '';
  readonly roles = OPTIONS.role;

  constructor(private readonly auth: AuthService, private readonly router: Router) {}

  async submit(): Promise<void> {
    this.error = '';
    try {
      await this.auth.register({
        fullName: this.fullName,
        email: this.email,
        password: this.password,
        documentId: this.documentId,
        phone: this.phone,
        role: this.role
      });
      await this.router.navigateByUrl('/app/dashboard');
    } catch (error) {
      const message = error instanceof Error ? error.message : '';
      if (message.toLowerCase().includes('already')) this.error = 'Ese correo ya está registrado.';
      else if (message.toLowerCase().includes('confirm')) this.error = 'Desactiva confirmar correo en Authentication o revisa tu bandeja.';
      else this.error = 'No se pudo crear la cuenta.';
    }
  }
}
