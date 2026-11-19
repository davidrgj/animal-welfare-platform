import { DatePipe } from '@angular/common';
import { AfterViewChecked, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonBackButton, IonButton, IonButtons, IonContent, IonHeader, IonItem, IonList, IonSelect, IonSelectOption, IonSkeletonText, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { Chart } from 'chart.js/auto';
import { Animal, Farm, WelfareRecord } from '../core/models';
import { COMPLIANCE_LABEL, SPECIES_LABEL, complianceClass } from '../core/labels';
import { StoreService } from '../core/store.service';
import { EmptyStateComponent } from '../shared/empty-state.component';
import { SpeciesMarkComponent } from '../shared/species-mark.component';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [DatePipe, FormsModule, IonBackButton, IonButton, IonButtons, IonContent, IonHeader, IonItem, IonList, IonSelect, IonSelectOption, IonSkeletonText, IonTitle, IonToolbar, EmptyStateComponent, SpeciesMarkComponent],
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
        @if (loading) {
          <section class="hero-card skeleton-surface" style="padding:20px">
            <ion-skeleton-text animated class="skeleton-pill" style="width:36%"></ion-skeleton-text>
            <ion-skeleton-text animated class="skeleton-block" style="height:88px;margin-top:14px"></ion-skeleton-text>
          </section>
        } @else {
          <p class="page-kicker">Cumplimiento</p>
          <p class="page-lead">IBA por predio, listo para imprimir.</p>
          @if (farms.length === 0) {
            <app-empty-state icon="leaf-outline" title="Sin predios" hint="Crea un predio para generar el reporte ICA." />
          } @else {
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
              @if (scoredAnimals.length) {
                <section class="panel">
                  <h2 class="panel-title">IBA por animal</h2>
                  <p class="chart-panel-lead">Comparativo del índice compuesto en el predio seleccionado.</p>
                  <div class="chart-frame"><canvas #reportCanvas></canvas></div>
                </section>
              }
              <section class="panel">
                <h2 class="panel-title">Inventario</h2>
                @if (animals.length === 0) {
                  <app-empty-state icon="document-text-outline" title="Predio vacío" hint="No hay ejemplares para armar el reporte." />
                } @else {
                  @for (animal of animals; track animal.id) {
                    <article class="animal-row record-card">
                      <div class="spread">
                        <div style="display:flex;gap:10px;align-items:center;min-width:0">
                          <app-species-mark [species]="animal.species" />
                          <strong class="display panel-title">{{ animal.tagId }}</strong>
                        </div>
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
          }
        }
      </div>
    </ion-content>
  `
})
export class ReportsPage implements OnInit, AfterViewChecked, OnDestroy {
  @ViewChild('reportCanvas') reportCanvas?: ElementRef<HTMLCanvasElement>;
  loading = true;
  farms: Farm[] = [];
  farm: Farm | null = null;
  farmId = '';
  animals: Animal[] = [];
  latest = new Map<string, WelfareRecord>();
  average = 0;
  nonCompliant = 0;
  generatedAt = new Date().toISOString();
  private chart: Chart | null = null;
  private chartDrawnFor = '';
  readonly species = SPECIES_LABEL;
  readonly compliance = COMPLIANCE_LABEL;
  readonly complianceClass = complianceClass;

  constructor(private readonly store: StoreService) {}

  get scoredAnimals(): Animal[] {
    return this.animals.filter((animal) => this.latest.has(animal.id));
  }

  async ngOnInit(): Promise<void> {
    this.farms = await this.store.farms();
    this.farmId = this.farms[0]?.id ?? '';
    await this.load();
    this.loading = false;
  }

  ngAfterViewChecked(): void {
    if (!this.loading && this.farm && this.scoredAnimals.length && this.chartDrawnFor !== this.farmId) {
      this.draw();
    }
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }

  async load(): Promise<void> {
    this.chart?.destroy();
    this.chart = null;
    this.chartDrawnFor = '';
    if (!this.farmId) {
      this.farm = null;
      return;
    }
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

  private draw(): void {
    const canvas = this.reportCanvas?.nativeElement;
    if (!canvas || !this.farm || this.chartDrawnFor === this.farmId) return;
    this.chartDrawnFor = this.farmId;
    const rows = this.scoredAnimals;
    this.chart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: rows.map((animal) => animal.tagId),
        datasets: [{
          label: 'IBA',
          data: rows.map((animal) => this.latest.get(animal.id)?.welfareIndex ?? 0),
          backgroundColor: rows.map((animal) => {
            const level = this.latest.get(animal.id)?.complianceLevel;
            if (level === 'NON_COMPLIANT') return '#ff3b30';
            if (level === 'ATTENTION') return '#ff9f0a';
            return '#30d158';
          }),
          borderRadius: 10,
          borderSkipped: false,
          maxBarThickness: 36
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { min: 0, max: 100, ticks: { color: '#86868B' }, grid: { color: 'rgba(60,60,67,0.08)' } },
          y: { grid: { display: false }, ticks: { color: '#1d1d1f', font: { size: 12, weight: 600 } } }
        }
      }
    });
  }
}
