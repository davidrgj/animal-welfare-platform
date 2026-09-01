import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IonButton, IonContent, IonHeader, IonInput, IonItem, IonList, IonSelect, IonSelectOption, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { Animal, EnvironmentScenario, FeedType, SimulationRun } from '../core/models';
import { FEED_LABEL, OPTIONS, SCENARIO_LABEL, SPECIES_LABEL } from '../core/labels';
import { StoreService } from '../core/store.service';
import { EmptyStateComponent } from '../shared/empty-state.component';
import { FloatingDatePickerComponent } from '../shared/floating-date-picker.component';
import { todayIso } from '../core/crypto';

@Component({
  selector: 'app-simulation',
  standalone: true,
  imports: [DatePipe, FormsModule, RouterLink, IonButton, IonContent, IonHeader, IonInput, IonItem, IonList, IonSelect, IonSelectOption, IonTitle, IonToolbar, EmptyStateComponent, FloatingDatePickerComponent],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Simulación</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <div class="page-body stack">
        <p class="page-kicker">Escenarios</p>
        <p class="page-lead">Proyecta peso, etapa y cumplimiento ICA antes de cambiar dieta o ambiente.</p>
        <form class="panel stack" (ngSubmit)="run()">
          <h2 class="panel-title">Nuevo escenario</h2>
          <ion-list>
            <ion-item><ion-input label="Nombre del escenario" labelPlacement="stacked" [(ngModel)]="name" name="name" required></ion-input></ion-item>
            <ion-item>
              <ion-select label="Animal" labelPlacement="stacked" [(ngModel)]="animalId" name="animal">
                @for (animal of animals; track animal.id) {
                  <ion-select-option [value]="animal.id">{{ animal.tagId }} · {{ species[animal.species] }}</ion-select-option>
                }
              </ion-select>
            </ion-item>
            <ion-item>
              <ion-select label="Tipo de alimentación" labelPlacement="stacked" [(ngModel)]="feedType" name="feed">
                @for (option of feed; track option[0]) { <ion-select-option [value]="option[0]">{{ option[1] }}</ion-select-option> }
              </ion-select>
            </ion-item>
            <ion-item>
              <ion-select label="Escenario ambiental" labelPlacement="stacked" [(ngModel)]="scenario" name="scenario">
                @for (option of scenarios; track option[0]) { <ion-select-option [value]="option[0]">{{ option[1] }}</ion-select-option> }
              </ion-select>
            </ion-item>
            <ion-item><ion-input label="Horizonte (días)" labelPlacement="stacked" type="number" min="14" max="365" [(ngModel)]="horizonDays" name="days"></ion-input></ion-item>
          </ion-list>
          <app-floating-date-picker label="Fecha de inicio" [(value)]="startDate" />
          @if (error) { <p class="error-text">{{ error }}</p> }
          <ion-button expand="block" type="submit" [disabled]="!animalId">Correr simulación</ion-button>
        </form>
        @if (runs.length === 0) {
          <app-empty-state icon="flask-outline" title="Sin escenarios" hint="Elige un animal y un estrés (sequía, calor, dieta) para proyectar el lote." />
        } @else {
          @for (run of runs; track run.id) {
            <a class="animal-row list-card" [routerLink]="['/app/simulation', run.id]">
              <span class="species-mark species-mark-sim">S</span>
              <div class="list-card-copy">
                <strong>{{ run.name }}</strong>
                <p class="muted">{{ feedLabel[run.feedType] }} · {{ scenarioLabel[run.scenario] }} · {{ run.horizonDays }} días</p>
                <p class="muted">{{ run.createdAt | date:'d MMM, y hh:mm a' }}</p>
              </div>
              <span class="tag">{{ run.finalWeightKg }} kg</span>
            </a>
          }
        }
      </div>
    </ion-content>
  `,
})
export class SimulationPage implements OnInit {
  animals: Animal[] = [];
  runs: SimulationRun[] = [];
  name = 'Sequía 90 días';
  animalId = '';
  feedType: FeedType = 'GRAZING';
  scenario: EnvironmentScenario = 'DROUGHT';
  horizonDays = 90;
  startDate = todayIso();
  error = '';
  readonly species = SPECIES_LABEL;
  readonly feed = OPTIONS.feed;
  readonly scenarios = OPTIONS.scenario;
  readonly feedLabel = FEED_LABEL;
  readonly scenarioLabel = SCENARIO_LABEL;

  constructor(private readonly store: StoreService, private readonly router: Router) {}

  async ngOnInit(): Promise<void> {
    this.animals = await this.store.animals();
    this.animalId = this.animals[0]?.id ?? '';
    this.runs = await this.store.simulations();
  }

  async run(): Promise<void> {
    this.error = '';
    try {
      const created = await this.store.createSimulation({
        name: this.name,
        animalId: this.animalId,
        feedType: this.feedType,
        scenario: this.scenario,
        horizonDays: Number(this.horizonDays),
        startDate: this.startDate
      });
      await this.router.navigate(['/app/simulation', created.id]);
    } catch {
      this.error = 'No se pudo correr la simulación.';
    }
  }
}
