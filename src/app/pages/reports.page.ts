import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonBackButton, IonButton, IonButtons, IonContent, IonHeader, IonItem, IonList, IonSelect, IonSelectOption, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { Animal, Farm, WelfareRecord } from '../core/models';
import { COMPLIANCE_LABEL, SPECIES_LABEL, complianceClass } from '../core/labels';
import { StoreService } from '../core/store.service';
import { EmptyStateComponent } from '../shared/empty-state.component';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [DatePipe, FormsModule, IonBackButton, IonButton, IonButtons, IonContent, IonHeader, IonItem, IonList, IonSelect, IonSelectOption, IonTitle, IonToolbar, EmptyStateComponent],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/app/profile" text="Atrás"></ion-back-button>
        </ion-buttons>
        <ion-title>Reportes</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <div class="page-body stack">
        <p class="page-kicker">Cumplimiento</p>
        <p class="page-lead">IBA por predio, listo para imprimir.</p>
        <ion-list class="panel">
          <ion-item>
            <ion-select cancelText="Cancelar" okText="Aceptar" label="Predio" labelPlacement="stacked" [(ngModel)]="farmId" (ionChange)="load()">
              @for (farm of farms; track farm.id) { <ion-select-option [value]="farm.id">{{ farm.name }}</ion-select-option> }
            </ion-select>
          </ion-item>
        </ion-list>
        @if (farm) {
          <section class="hero-card">
            <p class="page-kicker">Reporte ICA</p>
            <h1 class="display auth-title">{{ farm.name }}</h1>
            <p class="muted">Generado {{ generatedAt | date:'d MMM, y hh:mm a' }}</p>
            <div class="stat-pair">
              <div><span>IBA medio</span><strong>{{ average }}</strong></div>
              <div><span>Fuera de umbral</span><strong>{{ nonCompliant }}</strong></div>
            </div>
          </section>
          <section class="panel">
            <h2 class="panel-title">Inventario</h2>
            @if (animals.length === 0) {
              <app-empty-state icon="document-text-outline" title="Predio vacío" hint="No hay ejemplares para armar el reporte." />
            } @else {
              @for (animal of animals; track animal.id) {
                <article class="animal-row record-card">
                  <div class="spread">
                    <strong class="display panel-title">{{ animal.tagId }}</strong>
                    <span [class]="complianceClass(latest.get(animal.id)?.complianceLevel)">{{ latest.get(animal.id) ? compliance[latest.get(animal.id)!.complianceLevel] : 'Sin evaluación' }}</span>
                  </div>
                  <p class="muted">
                    {{ species[animal.species] }} · {{ animal.currentWeightKg }} kg
                    @if (latest.get(animal.id); as record) { · IBA {{ record.welfareIndex }} · {{ record.recordedAt | date:'d MMM, y' }} }
                  </p>
                </article>
              }
            }
            <ion-button expand="block" fill="outline" (click)="print()">Imprimir reporte</ion-button>
          </section>
        }
      </div>
    </ion-content>
  `
})
export class ReportsPage implements OnInit {
  farms: Farm[] = [];
  farm: Farm | null = null;
  farmId = '';
  animals: Animal[] = [];
  latest = new Map<string, WelfareRecord>();
  average = 0;
  nonCompliant = 0;
  generatedAt = new Date().toISOString();
  readonly species = SPECIES_LABEL;
  readonly compliance = COMPLIANCE_LABEL;
  readonly complianceClass = complianceClass;

  constructor(private readonly store: StoreService) {}

  async ngOnInit(): Promise<void> {
    this.farms = await this.store.farms();
    this.farmId = this.farms[0]?.id ?? '';
    await this.load();
  }

  async load(): Promise<void> {
    if (!this.farmId) return;
    this.farm = await this.store.farm(this.farmId);
    this.animals = await this.store.animals(this.farmId);
    this.latest.clear();
    let sum = 0;
    let scored = 0;
    this.nonCompliant = 0;
    for (const animal of this.animals) {
      const records = await this.store.recordsForAnimal(animal.id);
      if (records[0]) {
        this.latest.set(animal.id, records[0]);
        sum += records[0].welfareIndex;
        scored += 1;
        if (records[0].complianceLevel !== 'COMPLIANT') this.nonCompliant += 1;
      }
    }
    this.average = scored ? Math.round((sum / scored) * 10) / 10 : 0;
    this.generatedAt = new Date().toISOString();
  }

  print(): void {
    window.print();
  }
}
