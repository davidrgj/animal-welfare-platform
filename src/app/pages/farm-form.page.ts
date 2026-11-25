import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Geolocation } from '@capacitor/geolocation';
import { IonBackButton, IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonInput, IonItem, IonList, IonSelect, IonSelectOption, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { OPTIONS } from '../core/labels';
import { WaterSource } from '../core/models';
import { StoreService } from '../core/store.service';

@Component({
  selector: 'app-farm-form',
  standalone: true,
  imports: [FormsModule, IonBackButton, IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonInput, IonItem, IonList, IonSelect, IonSelectOption, IonTitle, IonToolbar],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/app/farms" text="Atrás"></ion-back-button>
        </ion-buttons>
        <ion-title>{{ farmId ? 'Editar predio' : 'Nuevo predio' }}</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <form class="page-body stack" (ngSubmit)="save()">
        <p class="page-kicker">Predio</p>
        <p class="page-lead">Identidad productiva, RUV y fuente hídrica.</p>
        <ion-list class="panel">
          <ion-item><ion-input label="Nombre del predio" labelPlacement="stacked" [(ngModel)]="name" name="name" required></ion-input></ion-item>
          <ion-item><ion-input label="Registro único de vacunación" labelPlacement="stacked" [(ngModel)]="vaccinationRegistry" name="ruv" required></ion-input></ion-item>
          <ion-item><ion-input label="Extensión (ha)" labelPlacement="stacked" type="number" [(ngModel)]="hectares" name="hectares" required></ion-input></ion-item>
          <ion-item><ion-input label="Latitud" labelPlacement="stacked" type="number" [(ngModel)]="latitude" name="lat" required></ion-input></ion-item>
          <ion-item><ion-input label="Longitud" labelPlacement="stacked" type="number" [(ngModel)]="longitude" name="lng" required></ion-input></ion-item>
          <div class="geo-actions">
            <ion-button type="button" expand="block" fill="outline" [disabled]="locating" (click)="captureCurrentLocation()">
              <ion-icon slot="start" name="location-outline" aria-hidden="true"></ion-icon>
              {{ locating ? 'Obteniendo ubicación…' : 'Usar ubicación actual' }}
            </ion-button>
            <p class="geo-hint">Usa el plugin de geolocalización (Capacitor) para completar latitud y longitud. También puedes digitarlas a mano.</p>
          </div>
          <ion-item>
            <ion-select cancelText="Cancelar" okText="Aceptar" label="Fuente de agua" labelPlacement="stacked" [(ngModel)]="waterSource" name="water">
              @for (option of water; track option[0]) { <ion-select-option [value]="option[0]">{{ option[1] }}</ion-select-option> }
            </ion-select>
          </ion-item>
          <ion-item><ion-input label="Tipo de suelo" labelPlacement="stacked" [(ngModel)]="soilType" name="soil"></ion-input></ion-item>
          <ion-item><ion-input label="Departamento" labelPlacement="stacked" [(ngModel)]="department" name="dept"></ion-input></ion-item>
          <ion-item><ion-input label="Municipio" labelPlacement="stacked" [(ngModel)]="municipality" name="muni"></ion-input></ion-item>
        </ion-list>
        @if (error) { <p class="error-text">{{ error }}</p> }
        <div class="form-actions">
          <ion-button expand="block" type="submit">Guardar predio</ion-button>
          @if (farmId) {
            <ion-button expand="block" fill="outline" color="danger" type="button" (click)="remove()">Eliminar predio</ion-button>
          }
        </div>
      </form>
    </ion-content>
  `,
  styles: [`
    .geo-actions {
      padding: 0.35rem 1rem 0.85rem;
    }
    .geo-hint {
      margin: 0.45rem 0 0;
      font-size: 0.85rem;
      color: var(--ion-color-medium, #6b7280);
      line-height: 1.35;
    }
  `]
})
export class FarmFormPage implements OnInit {
  farmId = '';
  name = '';
  vaccinationRegistry = '';
  hectares = 10;
  latitude = 4.71;
  longitude = -74.07;
  waterSource: WaterSource = 'SPRING';
  soilType = '';
  department = '';
  municipality = '';
  error = '';
  locating = false;
  readonly water = OPTIONS.water;

  constructor(private readonly store: StoreService, private readonly route: ActivatedRoute, private readonly router: Router) {}

  async ngOnInit(): Promise<void> {
    this.farmId = this.route.snapshot.paramMap.get('id') ?? '';
    if (!this.farmId) return;
    const farm = await this.store.farm(this.farmId);
    this.name = farm.name;
    this.vaccinationRegistry = farm.vaccinationRegistry;
    this.hectares = farm.hectares;
    this.latitude = farm.latitude;
    this.longitude = farm.longitude;
    this.waterSource = farm.waterSource;
    this.soilType = farm.soilType;
    this.department = farm.department;
    this.municipality = farm.municipality;
  }

  async captureCurrentLocation(): Promise<void> {
    this.error = '';
    this.locating = true;
    try {
      const permission = await Geolocation.requestPermissions();
      if (permission.location === 'denied') {
        this.error = 'Permiso de ubicación denegado. Actívalo en el navegador o digita las coordenadas.';
        return;
      }
      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      });
      this.latitude = Number(position.coords.latitude.toFixed(6));
      this.longitude = Number(position.coords.longitude.toFixed(6));
    } catch {
      this.error = 'No se pudo obtener la ubicación. Revisa el permiso de GPS o digita latitud y longitud.';
    } finally {
      this.locating = false;
    }
  }

  async save(): Promise<void> {
    this.error = '';
    try {
      await this.store.saveFarm({
        id: this.farmId || undefined,
        name: this.name,
        vaccinationRegistry: this.vaccinationRegistry,
        hectares: Number(this.hectares),
        latitude: Number(this.latitude),
        longitude: Number(this.longitude),
        waterSource: this.waterSource,
        soilType: this.soilType,
        department: this.department,
        municipality: this.municipality
      });
      await this.router.navigateByUrl('/app/farms');
    } catch {
      this.error = 'No se pudo guardar el predio.';
    }
  }

  async remove(): Promise<void> {
    await this.store.deleteFarm(this.farmId);
    await this.router.navigateByUrl('/app/farms');
  }
}
