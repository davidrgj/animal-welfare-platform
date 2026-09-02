import { DatePipe } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IonBackButton, IonButtons, IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { Chart } from 'chart.js/auto';
import { EVENT_LABEL, FEED_LABEL, SCENARIO_LABEL, STAGE_LABEL } from '../core/labels';
import { SimulationEvent, SimulationRun, SimulationSnapshot } from '../core/models';
import { StoreService } from '../core/store.service';
import { EmptyStateComponent } from '../shared/empty-state.component';

@Component({
  selector: 'app-simulation-detail',
  standalone: true,
  imports: [DatePipe, IonBackButton, IonButtons, IonContent, IonHeader, IonTitle, IonToolbar, EmptyStateComponent],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/app/simulation" text="Atrás"></ion-back-button>
        </ion-buttons>
        <ion-title>{{ run?.name || 'Escenario' }}</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      @if (run) {
        <div class="page-body stack">
          <section class="hero-card hero-ink">
            <p class="page-kicker">{{ feed[run.feedType] }} · {{ scenario[run.scenario] }}</p>
            <h1 class="display auth-title">{{ run.name }}</h1>
            <div class="stat-pair">
              <div>
                <span>Peso final</span>
                <strong>{{ run.finalWeightKg }} kg</strong>
              </div>
              <div>
                <span>IBA proyectado</span>
                <strong>{{ run.finalWelfareIndex }}</strong>
              </div>
            </div>
            <p class="muted">Peso objetivo: {{ run.estimatedTargetWeightDate ? (run.estimatedTargetWeightDate | date:'d MMM, y') : 'No alcanzado en el horizonte' }}</p>
            <p class="muted">Cumplimiento IBA ≥ 80: {{ run.estimatedComplianceDate ? (run.estimatedComplianceDate | date:'d MMM, y') : 'No alcanzado' }}</p>
          </section>
          <section class="panel">
            <h2 class="panel-title">Trayectoria</h2>
            <div class="chart-frame"><canvas #chartCanvas></canvas></div>
          </section>
          <section class="panel">
            <h2 class="panel-title">Eventos discretos</h2>
            @if (events.length === 0) {
              <app-empty-state icon="analytics-outline" title="Sin eventos" hint="Este escenario no disparó transiciones ni incidentes." />
            } @else {
              @for (event of events; track event.id) {
                <article class="animal-row timeline-item">
                  <strong>{{ eventLabel[event.eventType] }}</strong>
                  <p class="muted">
                    {{ event.eventDate | date:'d MMM, y' }}
                    @if (event.fromStage && event.toStage && event.fromStage !== event.toStage) {
                      · {{ stage[event.fromStage] || event.fromStage }} → {{ stage[event.toStage] || event.toStage }}
                    }
                  </p>
                </article>
              }
            }
          </section>
        </div>
      }
    </ion-content>
  `
})
export class SimulationDetailPage implements AfterViewInit, OnDestroy {
  @ViewChild('chartCanvas') chartCanvas?: ElementRef<HTMLCanvasElement>;
  run: SimulationRun | null = null;
  snapshots: SimulationSnapshot[] = [];
  events: SimulationEvent[] = [];
  chart: Chart | null = null;
  readonly feed = FEED_LABEL;
  readonly scenario = SCENARIO_LABEL;
  readonly eventLabel = EVENT_LABEL;
  readonly stage = STAGE_LABEL;

  constructor(
    private readonly store: StoreService,
    private readonly route: ActivatedRoute,
    private readonly changeDetector: ChangeDetectorRef
  ) {}

  async ngAfterViewInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    const detail = await this.store.simulation(id);
    this.run = detail.run;
    this.snapshots = detail.snapshots;
    this.events = detail.events;
    this.changeDetector.detectChanges();
    this.draw();
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }

  private draw(): void {
    const canvas = this.chartCanvas?.nativeElement;
    if (!canvas || this.snapshots.length === 0) return;
    this.chart = new Chart(canvas, {
      type: 'line',
      data: {
        labels: this.snapshots.filter((_, index) => index % 7 === 0 || index === this.snapshots.length - 1).map((snapshot) => snapshot.simulatedDate.slice(5)),
        datasets: [
          {
            label: 'Peso (kg)',
            data: this.snapshots.filter((_, index) => index % 7 === 0 || index === this.snapshots.length - 1).map((snapshot) => snapshot.weightKg),
            borderColor: '#007AFF',
            backgroundColor: 'rgba(0,122,255,0.12)',
            tension: 0.35,
            fill: true,
            pointRadius: 0,
            pointHoverRadius: 4,
            yAxisID: 'y'
          },
          {
            label: 'IBA',
            data: this.snapshots.filter((_, index) => index % 7 === 0 || index === this.snapshots.length - 1).map((snapshot) => snapshot.welfareIndex),
            borderColor: '#FF9500',
            backgroundColor: 'rgba(255,149,0,0.08)',
            tension: 0.35,
            pointRadius: 0,
            pointHoverRadius: 4,
            yAxisID: 'y1'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { labels: { font: { family: 'Inter', size: 12 }, color: '#86868B' } } },
        scales: {
          y: { position: 'left', ticks: { color: '#86868B', font: { family: 'Inter' } }, grid: { color: 'rgba(60,60,67,0.08)' } },
          y1: { position: 'right', min: 0, max: 100, grid: { drawOnChartArea: false }, ticks: { color: '#FF9500', font: { family: 'Inter' } } }
        }
      }
    });
  }
}
