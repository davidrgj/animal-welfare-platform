import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonButton, IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { Animal, Farm, WelfareRecord } from '../core/models';
import { COMPLIANCE_LABEL, SPECIES_LABEL, complianceClass, ibaFill, speciesMark } from '../core/labels';
import { StoreService } from '../core/store.service';
import { EmptyStateComponent } from '../shared/empty-state.component';

@Component({
  selector: 'app-animals',
  standalone: true,
  imports: [RouterLink, IonButton, IonContent, IonHeader, IonTitle, IonToolbar, EmptyStateComponent],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Animales</ion-title>
        <ion-button slot="end" fill="clear" routerLink="/app/animals/new">Nuevo animal</ion-button>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <div class="page-body stack">
        <p class="page-kicker">Inventario</p>
        <p class="page-lead">Inventario individual por especie, con el último índice de bienestar.</p>
        @if (animals.length === 0) {
          <app-empty-state icon="paw-outline" title="Sin animales" hint="Da de alta un ejemplar en un predio para evaluar bienestar." />
        } @else {
          @for (animal of animals; track animal.id) {
            <a class="animal-row list-card" [routerLink]="['/app/animals', animal.id]">
              <span [class]="speciesMark(animal.species)">{{ species[animal.species].charAt(0) }}</span>
              <div class="list-card-copy">
                <strong>{{ animal.tagId }}</strong>
                <p class="muted">{{ species[animal.species] }} · {{ animal.breed }} · {{ farmName(animal.farmId) }}</p>
                <p class="muted">{{ animal.currentWeightKg }} kg @if (latest.get(animal.id); as record) { · IBA {{ record.welfareIndex }} }</p>
                @if (latest.get(animal.id); as record) {
                  <div class="iba-track">
                    <span [class]="ibaFill(record.complianceLevel)" [style.width.%]="record.welfareIndex"></span>
                  </div>
                }
              </div>
              <span [class]="complianceClass(latest.get(animal.id)?.complianceLevel)">{{ latest.get(animal.id) ? compliance[latest.get(animal.id)!.complianceLevel] : 'Sin evaluación' }}</span>
            </a>
          }
        }
      </div>
    </ion-content>
  `
})
export class AnimalsPage implements OnInit {
  animals: Animal[] = [];
  farms: Farm[] = [];
  latest = new Map<string, WelfareRecord>();
  readonly species = SPECIES_LABEL;
  readonly compliance = COMPLIANCE_LABEL;
  readonly complianceClass = complianceClass;
  readonly speciesMark = speciesMark;
  readonly ibaFill = ibaFill;

  constructor(private readonly store: StoreService) {}

  async ngOnInit(): Promise<void> {
    this.farms = await this.store.farms();
    this.animals = await this.store.animals();
    for (const animal of this.animals) {
      const records = await this.store.recordsForAnimal(animal.id);
      if (records[0]) this.latest.set(animal.id, records[0]);
    }
  }

  farmName(farmId: string): string {
    return this.farms.find((farm) => farm.id === farmId)?.name ?? '';
  }
}
