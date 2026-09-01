import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IonButton, IonContent, IonHeader, IonInput, IonItem, IonList, IonSelect, IonSelectOption, IonTitle, IonToolbar, IonToggle } from '@ionic/angular/standalone';
import { OPTIONS } from '../core/labels';
import { AnimalPurpose, Farm, HornType, ReproductiveStatus, Sex, Species, SwineStage } from '../core/models';
import { StoreService } from '../core/store.service';
import { FloatingDatePickerComponent } from '../shared/floating-date-picker.component';
import { todayIso } from '../core/crypto';

@Component({
  selector: 'app-animal-form',
  standalone: true,
  imports: [FormsModule, IonButton, IonContent, IonHeader, IonInput, IonItem, IonList, IonSelect, IonSelectOption, IonTitle, IonToolbar, IonToggle, FloatingDatePickerComponent],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>{{ animalId ? 'Editar animal' : 'Nuevo animal' }}</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <form class="page-body stack" (ngSubmit)="save()">
        <ion-list class="panel">
          <ion-item>
            <ion-select label="Predio" labelPlacement="stacked" [(ngModel)]="farmId" name="farm" required>
              @for (farm of farms; track farm.id) { <ion-select-option [value]="farm.id">{{ farm.name }}</ion-select-option> }
            </ion-select>
          </ion-item>
          <ion-item><ion-input label="Identificación (chapa o tag)" labelPlacement="stacked" [(ngModel)]="tagId" name="tag" required></ion-input></ion-item>
          <ion-item>
            <ion-select label="Especie" labelPlacement="stacked" [(ngModel)]="species" name="species">
              @for (option of speciesOptions; track option[0]) { <ion-select-option [value]="option[0]">{{ option[1] }}</ion-select-option> }
            </ion-select>
          </ion-item>
          <ion-item><ion-input label="Raza" labelPlacement="stacked" [(ngModel)]="breed" name="breed" required></ion-input></ion-item>
          <app-floating-date-picker label="Fecha de nacimiento" [(value)]="birthDate" />
          <ion-item>
            <ion-select label="Sexo" labelPlacement="stacked" [(ngModel)]="sex" name="sex">
              @for (option of sexOptions; track option[0]) { <ion-select-option [value]="option[0]">{{ option[1] }}</ion-select-option> }
            </ion-select>
          </ion-item>
          <ion-item><ion-input label="Peso inicial (kg)" labelPlacement="stacked" type="number" [(ngModel)]="initialWeightKg" name="initial" required></ion-input></ion-item>
          <ion-item><ion-input label="Peso actual (kg)" labelPlacement="stacked" type="number" [(ngModel)]="currentWeightKg" name="current" required></ion-input></ion-item>
          <ion-item>
            <ion-select label="Estado reproductivo" labelPlacement="stacked" [(ngModel)]="reproductiveStatus" name="repro">
              @for (option of reproOptions; track option[0]) { <ion-select-option [value]="option[0]">{{ option[1] }}</ion-select-option> }
            </ion-select>
          </ion-item>
          <ion-item>
            <ion-select label="Propósito" labelPlacement="stacked" [(ngModel)]="purpose" name="purpose">
              @for (option of purposeOptions; track option[0]) { <ion-select-option [value]="option[0]">{{ option[1] }}</ion-select-option> }
            </ion-select>
          </ion-item>
          @if (species === 'GOAT') {
            <ion-item>
              <ion-select label="Tipo de cornamenta" labelPlacement="stacked" [(ngModel)]="hornType" name="horn">
                @for (option of hornOptions; track option[0]) { <ion-select-option [value]="option[0]">{{ option[1] }}</ion-select-option> }
              </ion-select>
            </ion-item>
          }
          @if (species === 'CATTLE') {
            <ion-item><ion-toggle [(ngModel)]="electricFenceAssociated" name="fence">Cerca eléctrica asociada</ion-toggle></ion-item>
          }
          @if (species === 'SWINE') {
            <ion-item>
              <ion-select label="Etapa productiva" labelPlacement="stacked" [(ngModel)]="swineStage" name="stage">
                @for (option of swineOptions; track option[0]) { <ion-select-option [value]="option[0]">{{ option[1] }}</ion-select-option> }
              </ion-select>
            </ion-item>
            <ion-item><ion-toggle [(ngModel)]="environmentalEnrichment" name="enrich">Enriquecimiento ambiental</ion-toggle></ion-item>
          }
        </ion-list>
        @if (error) { <p class="error-text">{{ error }}</p> }
        <ion-button expand="block" type="submit">Guardar animal</ion-button>
      </form>
    </ion-content>
  `
})
export class AnimalFormPage implements OnInit {
  animalId = '';
  farms: Farm[] = [];
  farmId = '';
  tagId = '';
  species: Species = 'CATTLE';
  breed = '';
  birthDate = todayIso();
  sex: Sex = 'FEMALE';
  initialWeightKg = 100;
  currentWeightKg = 100;
  reproductiveStatus: ReproductiveStatus = 'OPEN';
  purpose: AnimalPurpose = 'MEAT';
  hornType: HornType | null = 'POLLED';
  electricFenceAssociated = false;
  swineStage: SwineStage | null = 'FATTENING';
  environmentalEnrichment = false;
  error = '';
  readonly speciesOptions = OPTIONS.species;
  readonly sexOptions = OPTIONS.sex;
  readonly purposeOptions = OPTIONS.purpose;
  readonly reproOptions = OPTIONS.repro;
  readonly hornOptions = OPTIONS.horn;
  readonly swineOptions = OPTIONS.swine;

  constructor(private readonly store: StoreService, private readonly route: ActivatedRoute, private readonly router: Router) {}

  async ngOnInit(): Promise<void> {
    this.farms = await this.store.farms();
    this.farmId = this.farms[0]?.id ?? '';
    this.animalId = this.route.snapshot.paramMap.get('id') ?? '';
    if (!this.animalId) return;
    const animal = await this.store.animal(this.animalId);
    this.farmId = animal.farmId;
    this.tagId = animal.tagId;
    this.species = animal.species;
    this.breed = animal.breed;
    this.birthDate = animal.birthDate;
    this.sex = animal.sex;
    this.initialWeightKg = animal.initialWeightKg;
    this.currentWeightKg = animal.currentWeightKg;
    this.reproductiveStatus = animal.reproductiveStatus;
    this.purpose = animal.purpose;
    this.hornType = animal.hornType;
    this.electricFenceAssociated = Boolean(animal.electricFenceAssociated);
    this.swineStage = animal.swineStage;
    this.environmentalEnrichment = Boolean(animal.environmentalEnrichment);
  }

  async save(): Promise<void> {
    this.error = '';
    try {
      const saved = await this.store.saveAnimal({
        id: this.animalId || undefined,
        farmId: this.farmId,
        tagId: this.tagId,
        species: this.species,
        breed: this.breed,
        birthDate: this.birthDate,
        sex: this.sex,
        initialWeightKg: Number(this.initialWeightKg),
        currentWeightKg: Number(this.currentWeightKg),
        reproductiveStatus: this.reproductiveStatus,
        purpose: this.purpose,
        hornType: this.hornType,
        electricFenceAssociated: this.electricFenceAssociated,
        swineStage: this.swineStage,
        environmentalEnrichment: this.environmentalEnrichment
      });
      await this.router.navigate(['/app/animals', saved.id]);
    } catch (error) {
      this.error = error instanceof Error ? 'Revisa los datos del ejemplar. ' + (error.message.includes('Tag') ? 'Esa chapa ya existe en el predio.' : '') : 'No se pudo guardar.';
    }
  }
}
