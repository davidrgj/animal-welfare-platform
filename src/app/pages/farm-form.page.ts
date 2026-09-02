import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IonBackButton, IonButton, IonButtons, IonContent, IonHeader, IonInput, IonItem, IonList, IonSelect, IonSelectOption, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { OPTIONS } from '../core/labels';
import { WaterSource } from '../core/models';
import { StoreService } from '../core/store.service';

@Component({
  selector: 'app-farm-form',
  standalone: true,
  imports: [FormsModule, IonBackButton, IonButton, IonButtons, IonContent, IonHeader, IonInput, IonItem, IonList, IonSelect, IonSelectOption, IonTitle, IonToolbar],
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
        <p class="page-kicker">Paso 1</p>
        <p class="page-lead">Datos de la finca. Luego podrás dar de alta animales en este predio.</p>
        <ion-list class="panel">
          <ion-item><ion-input label="Nombre del predio" labelPlacement="stacked" [(ngModel)]="name" name="name" required></ion-input></ion-item>
          <ion-item><ion-input label="Registro único de vacunación" labelPlacement="stacked" [(ngModel)]="vaccinationRegistry" name="ruv" required></ion-input></ion-item>
          <ion-item><ion-input label="Extensión (ha)" labelPlacement="stacked" type="number" [(ngModel)]="hectares" name="hectares" required></ion-input></ion-item>
          <ion-item><ion-input label="Latitud" labelPlacement="stacked" type="number" [(ngModel)]="latitude" name="lat" required></ion-input></ion-item>
          <ion-item><ion-input label="Longitud" labelPlacement="stacked" type="number" [(ngModel)]="longitude" name="lng" required></ion-input></ion-item>
          <ion-item>
            <ion-select label="Fuente de agua" labelPlacement="stacked" [(ngModel)]="waterSource" name="water">
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
  `
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
