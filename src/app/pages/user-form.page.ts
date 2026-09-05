import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IonBackButton, IonButton, IonButtons, IonContent, IonHeader, IonInput, IonItem, IonList, IonSelect, IonSelectOption, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { OPTIONS, ROLE_LABEL } from '../core/labels';
import { UserRole } from '../core/models';
import { isCloud } from '../core/supabase.client';
import { StoreService } from '../core/store.service';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [FormsModule, IonBackButton, IonButton, IonButtons, IonContent, IonHeader, IonInput, IonItem, IonList, IonSelect, IonSelectOption, IonTitle, IonToolbar],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/app/users" text="Atrás"></ion-back-button>
        </ion-buttons>
        <ion-title>{{ userId ? 'Editar usuario' : 'Nuevo usuario' }}</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <form class="page-body stack" (ngSubmit)="save()">
        <p class="page-kicker">Acceso</p>
        <p class="page-lead">{{ userId ? 'Actualiza datos y rol del usuario.' : 'Alta de cuenta con rol asignado.' }}</p>
        <ion-list class="panel">
          <ion-item><ion-input label="Nombre completo" labelPlacement="stacked" [(ngModel)]="fullName" name="fullName" required></ion-input></ion-item>
          <ion-item>
            <ion-input
              label="Correo electrónico"
              labelPlacement="stacked"
              type="email"
              [(ngModel)]="email"
              name="email"
              [readonly]="!!userId"
              required
            ></ion-input>
          </ion-item>
          @if (!userId || (!cloud && userId)) {
            <ion-item>
              <ion-input
                [label]="userId ? 'Nueva contraseña (opcional)' : 'Contraseña'"
                labelPlacement="stacked"
                type="password"
                [(ngModel)]="password"
                name="password"
                [required]="!userId"
              ></ion-input>
            </ion-item>
          }
          <ion-item><ion-input label="Documento" labelPlacement="stacked" [(ngModel)]="documentId" name="documentId" required></ion-input></ion-item>
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
        <div class="form-actions">
          <ion-button expand="block" type="submit">{{ userId ? 'Guardar cambios' : 'Crear usuario' }}</ion-button>
          @if (userId && !cloud) {
            <ion-button expand="block" fill="outline" color="danger" type="button" (click)="remove()">Eliminar usuario</ion-button>
          }
        </div>
      </form>
    </ion-content>
  `
})
export class UserFormPage implements OnInit {
  userId = '';
  fullName = '';
  email = '';
  password = '';
  documentId = '';
  phone = '';
  role: UserRole = 'PRODUCER';
  error = '';
  readonly cloud = isCloud();
  readonly roles = OPTIONS.role;
  readonly roleLabel = ROLE_LABEL;

  constructor(private readonly store: StoreService, private readonly route: ActivatedRoute, private readonly router: Router) {}

  async ngOnInit(): Promise<void> {
    this.userId = this.route.snapshot.paramMap.get('id') ?? '';
    if (!this.userId) return;
    const user = await this.store.user(this.userId);
    this.fullName = user.fullName;
    this.email = user.email;
    this.documentId = user.documentId;
    this.phone = user.phone;
    this.role = user.role;
  }

  async save(): Promise<void> {
    this.error = '';
    try {
      await this.store.saveUser({
        id: this.userId || undefined,
        fullName: this.fullName,
        email: this.email,
        password: this.password || undefined,
        documentId: this.documentId,
        phone: this.phone,
        role: this.role
      });
      await this.router.navigateByUrl('/app/users');
    } catch (error) {
      const message = error instanceof Error ? error.message : '';
      if (message.includes('already') || message.includes('registered')) this.error = 'Ese correo ya está registrado.';
      else if (message.includes('last administrator')) this.error = 'Debe quedar al menos un administrador.';
      else if (message.includes('Password') || message.includes('characters')) this.error = 'La contraseña debe tener al menos 6 caracteres.';
      else if (message.includes('admin-policies') || message.includes('RLS')) {
        this.error = 'Falta aplicar supabase/admin-policies.sql en el SQL Editor de Supabase.';
      }
      else if (message.includes('Cloud delete')) this.error = 'En la nube elimina el usuario desde Supabase Auth.';
      else this.error = message || 'No se pudo guardar el usuario.';
    }
  }

  async remove(): Promise<void> {
    this.error = '';
    try {
      await this.store.deleteUser(this.userId);
      await this.router.navigateByUrl('/app/users');
    } catch (error) {
      const message = error instanceof Error ? error.message : '';
      if (message.includes('own account')) this.error = 'No puedes eliminar tu propia cuenta.';
      else if (message.includes('last administrator')) this.error = 'Debe quedar al menos un administrador.';
      else if (message.includes('Cloud delete')) this.error = 'En la nube elimina el usuario desde Supabase Auth.';
      else this.error = 'No se pudo eliminar.';
    }
  }
}
