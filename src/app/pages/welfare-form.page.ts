import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IonBackButton, IonButton, IonButtons, IonContent, IonHeader, IonInput, IonItem, IonList, IonSelect, IonSelectOption, IonTextarea, IonTitle, IonToggle, IonToolbar } from '@ionic/angular/standalone';
import { Animal, BeddingStatus, HandlingQuality, LamenessScore, SocialInteraction } from '../core/models';
import { OPTIONS } from '../core/labels';
import { StoreService } from '../core/store.service';
import { nowIso } from '../core/crypto';

@Component({
  selector: 'app-welfare-form',
  standalone: true,
  imports: [FormsModule, IonBackButton, IonButton, IonButtons, IonContent, IonHeader, IonInput, IonItem, IonList, IonSelect, IonSelectOption, IonTextarea, IonTitle, IonToggle, IonToolbar],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button [defaultHref]="animal ? '/app/animals/' + animal.id : '/app/animals'" text="Atrás"></ion-back-button>
        </ion-buttons>
        <ion-title>Evaluación de bienestar</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <form class="page-body stack" (ngSubmit)="save()">
        <p class="page-kicker">Paso 3</p>
        <p class="page-lead">Cómo está {{ animal?.tagId }}. Al guardar se calcula el IBA y, si algo falla, sale aviso en Inicio.</p>
        <ion-list class="panel">
          <ion-item><ion-input label="Condición corporal (1-5)" labelPlacement="stacked" type="number" min="1" max="5" [(ngModel)]="bodyConditionScore" name="bcs" required></ion-input></ion-item>
          <ion-item><ion-input label="Tomas de agua al día" labelPlacement="stacked" type="number" min="0" [(ngModel)]="hydrationTimesPerDay" name="water" required></ion-input></ion-item>
          <ion-item>
            <ion-select label="Estado de camas" labelPlacement="stacked" [(ngModel)]="beddingStatus" name="bedding">
              @for (option of bedding; track option[0]) { <ion-select-option [value]="option[0]">{{ option[1] }}</ion-select-option> }
            </ion-select>
          </ion-item>
          <ion-item><ion-input label="Sombra disponible (%)" labelPlacement="stacked" type="number" min="0" max="100" [(ngModel)]="shadePercentage" name="shade" required></ion-input></ion-item>
          <ion-item><ion-input label="Temperatura ambiente (°C)" labelPlacement="stacked" type="number" [(ngModel)]="ambientTemperatureC" name="temp" required></ion-input></ion-item>
          <ion-item><ion-input label="Humedad relativa (%)" labelPlacement="stacked" type="number" min="0" max="100" [(ngModel)]="relativeHumidity" name="rh" required></ion-input></ion-item>
          <ion-item>
            <ion-select label="Cojera" labelPlacement="stacked" [(ngModel)]="lameness" name="lameness">
              @for (option of lamenessOptions; track option[0]) { <ion-select-option [value]="option[0]">{{ option[1] }}</ion-select-option> }
            </ion-select>
          </ion-item>
          <ion-item><ion-toggle [(ngModel)]="skinLesions" name="lesions">Lesiones en piel</ion-toggle></ion-item>
          <ion-item><ion-toggle [(ngModel)]="vaccinationUpToDate" name="vax">Vacunación al día</ion-toggle></ion-item>
          <ion-item><ion-input label="Espacio por animal (m²)" labelPlacement="stacked" type="number" [(ngModel)]="spacePerAnimalM2" name="space" required></ion-input></ion-item>
          <ion-item>
            <ion-select label="Interacción social" labelPlacement="stacked" [(ngModel)]="socialInteraction" name="social">
              @for (option of social; track option[0]) { <ion-select-option [value]="option[0]">{{ option[1] }}</ion-select-option> }
            </ion-select>
          </ion-item>
          <ion-item>
            <ion-select label="Calidad del manejo" labelPlacement="stacked" [(ngModel)]="handlingQuality" name="handling">
              @for (option of handling; track option[0]) { <ion-select-option [value]="option[0]">{{ option[1] }}</ion-select-option> }
            </ion-select>
          </ion-item>
          <ion-item><ion-textarea label="Notas" labelPlacement="stacked" [(ngModel)]="notes" name="notes"></ion-textarea></ion-item>
        </ion-list>
        <div class="panel">
          <label class="field-label">Evidencia fotográfica</label>
          <input class="field-box" type="file" accept="image/*" (change)="onFile($event)" />
        </div>
        @if (error) { <p class="error-text">{{ error }}</p> }
        <div class="form-actions">
          <ion-button expand="block" type="submit">Calcular índice y guardar</ion-button>
        </div>
      </form>
    </ion-content>
  `
})
export class WelfareFormPage implements OnInit {
  animal: Animal | null = null;
  bodyConditionScore = 3;
  hydrationTimesPerDay = 3;
  beddingStatus: BeddingStatus = 'ADEQUATE';
  shadePercentage = 50;
  ambientTemperatureC = 24;
  relativeHumidity = 65;
  lameness: LamenessScore = 'ABSENT';
  skinLesions = false;
  vaccinationUpToDate = true;
  spacePerAnimalM2 = 5;
  socialInteraction: SocialInteraction = 'ADEQUATE';
  handlingQuality: HandlingQuality = 'CALM';
  notes = '';
  photo: File | null = null;
  error = '';
  readonly bedding = OPTIONS.bedding;
  readonly lamenessOptions = OPTIONS.lameness;
  readonly social = OPTIONS.social;
  readonly handling = OPTIONS.handling;

  constructor(private readonly store: StoreService, private readonly route: ActivatedRoute, private readonly router: Router) {}

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    this.animal = await this.store.animal(id);
    this.spacePerAnimalM2 = this.store.spaceMinimum(this.animal);
  }

  onFile(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.photo = input.files?.[0] ?? null;
  }

  async save(): Promise<void> {
    if (!this.animal) return;
    this.error = '';
    try {
      const record = await this.store.createRecord({
        animalId: this.animal.id,
        recordedAt: nowIso(),
        bodyConditionScore: Number(this.bodyConditionScore),
        hydrationTimesPerDay: Number(this.hydrationTimesPerDay),
        beddingStatus: this.beddingStatus,
        shadePercentage: Number(this.shadePercentage),
        ambientTemperatureC: Number(this.ambientTemperatureC),
        relativeHumidity: Number(this.relativeHumidity),
        lameness: this.lameness,
        skinLesions: this.skinLesions,
        vaccinationUpToDate: this.vaccinationUpToDate,
        spacePerAnimalM2: Number(this.spacePerAnimalM2),
        socialInteraction: this.socialInteraction,
        handlingQuality: this.handlingQuality,
        notes: this.notes
      });
      if (this.photo) await this.store.addPhoto(record.id, this.photo);
      await this.router.navigate(['/app/animals', this.animal.id]);
    } catch {
      this.error = 'No se pudo guardar la evaluación.';
    }
  }
}
