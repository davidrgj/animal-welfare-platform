import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonButton, IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { Animal, Farm, WelfareRecord } from '../core/models';
import { COMPLIANCE_LABEL, SPECIES_LABEL, complianceClass, ibaFill, speciesMark } from '../core/labels';
import { StoreService } from '../core/store.service';
import { EmptyStateComponent } from '../shared/empty-state.component';

type AnimalFilter = 'ALL' | 'RISK' | 'OK' | 'OPEN';

@Component({
  selector: 'app-animals',
  standalone: true,
  imports: [RouterLink, IonButton, IonContent, IonHeader, IonTitle, IonToolbar, EmptyStateComponent],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Animales</ion-title>
        <ion-button slot="end" fill="clear" routerLink="/app/animals/new">Nuevo</ion-button>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <div class="page-body stack">
        <section class="hero-card hero-ink">
          <p class="page-kicker">Inventario vivo</p>
          <h1 class="display section-title">{{ animals.length }} ejemplares</h1>
          <p class="status-meta">{{ riskCount }} en riesgo · {{ openCount }} sin IBA · {{ okCount }} en umbral</p>
        </section>

        @if (animals.length) {
          <div class="filter-bar" role="tablist">
            <button type="button" [class.active]="filter === 'ALL'" (click)="filter = 'ALL'">Todos</button>
            <button type="button" [class.active]="filter === 'RISK'" (click)="filter = 'RISK'">Riesgo</button>
            <button type="button" [class.active]="filter === 'OPEN'" (click)="filter = 'OPEN'">Sin IBA</button>
            <button type="button" [class.active]="filter === 'OK'" (click)="filter = 'OK'">Cumple</button>
          </div>
        }

        @if (animals.length === 0) {
          <app-empty-state icon="paw-outline" title="Sin animales" hint="Registra el primer ejemplar en un predio para empezar el monitoreo." />
        } @else if (visible.length === 0) {
          <app-empty-state icon="checkmark-circle-outline" title="Nada en este filtro" hint="Cambia el filtro o abre el inventario completo." />
        } @else {
          <div class="stack">
            @for (animal of visible; track animal.id) {
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
                <span [class]="complianceClass(latest.get(animal.id)?.complianceLevel)">{{ latest.get(animal.id) ? compliance[latest.get(animal.id)!.complianceLevel] : 'Sin IBA' }}</span>
              </a>
            }
          </div>
        }
      </div>
    </ion-content>
  `
})
export class AnimalsPage implements OnInit {
  animals: Animal[] = [];
  farms: Farm[] = [];
  latest = new Map<string, WelfareRecord>();
  filter: AnimalFilter = 'ALL';
  readonly species = SPECIES_LABEL;
  readonly compliance = COMPLIANCE_LABEL;
  readonly complianceClass = complianceClass;
  readonly speciesMark = speciesMark;
  readonly ibaFill = ibaFill;

  constructor(private readonly store: StoreService) {}

  get visible(): Animal[] {
    return this.animals.filter((animal) => {
      const level = this.latest.get(animal.id)?.complianceLevel;
      if (this.filter === 'ALL') return true;
      if (this.filter === 'OPEN') return !level;
      if (this.filter === 'OK') return level === 'COMPLIANT';
      return level === 'ATTENTION' || level === 'NON_COMPLIANT';
    });
  }

  get riskCount(): number {
    return this.animals.filter((animal) => {
      const level = this.latest.get(animal.id)?.complianceLevel;
      return level === 'ATTENTION' || level === 'NON_COMPLIANT';
    }).length;
  }

  get openCount(): number {
    return this.animals.filter((animal) => !this.latest.get(animal.id)).length;
  }

  get okCount(): number {
    return this.animals.filter((animal) => this.latest.get(animal.id)?.complianceLevel === 'COMPLIANT').length;
  }

  async ngOnInit(): Promise<void> {
    this.farms = await this.store.farms();
    this.animals = await this.store.animals();
    this.latest = await this.store.latestRecords();
  }

  farmName(farmId: string): string {
    return this.farms.find((farm) => farm.id === farmId)?.name ?? '';
  }
}
