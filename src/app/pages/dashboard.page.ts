import { DatePipe } from '@angular/common';
import { AfterViewChecked, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonButton, IonContent, IonHeader, IonSkeletonText, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { Chart } from 'chart.js/auto';
import { AuthService } from '../core/auth.service';
import { ALERT_HINT, COMPLIANCE_LABEL, FINDING_LABEL, HEAT_LABEL, SPECIES_LABEL, complianceClass, ibaFill, severityClass } from '../core/labels';
import { ComplianceLevel } from '../core/models';
import { DashboardData, StoreService } from '../core/store.service';
import { AccountMenuComponent } from '../shared/account-menu.component';
import { EmptyStateComponent } from '../shared/empty-state.component';
import { IbaRingComponent } from '../shared/iba-ring.component';
import { SpeciesMarkComponent } from '../shared/species-mark.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [DatePipe, RouterLink, IonButton, IonContent, IonHeader, IonSkeletonText, IonTitle, IonToolbar, AccountMenuComponent, EmptyStateComponent, IbaRingComponent, SpeciesMarkComponent],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Estado ICA</ion-title>
        <app-account-menu></app-account-menu>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <div class="page-body stack">
        @if (loading) {
          <section class="status-hero skeleton-surface skeleton-row" style="display:grid;grid-template-columns:auto 1fr;gap:16px;padding:20px">
            <ion-skeleton-text animated class="skeleton-circle" style="width:96px;height:96px"></ion-skeleton-text>
            <div class="skeleton-lines" style="align-self:center">
              <ion-skeleton-text animated class="skeleton-pill" style="width:28%"></ion-skeleton-text>
              <ion-skeleton-text animated class="skeleton-pill" style="width:72%"></ion-skeleton-text>
              <ion-skeleton-text animated class="skeleton-pill" style="width:54%"></ion-skeleton-text>
            </div>
          </section>
          <div class="skeleton-list">
            @for (row of [1, 2, 3]; track row) {
              <div class="list-card skeleton-surface skeleton-row">
                <ion-skeleton-text animated class="skeleton-circle"></ion-skeleton-text>
                <div class="skeleton-lines">
                  <ion-skeleton-text animated class="skeleton-pill" style="width:42%"></ion-skeleton-text>
                  <ion-skeleton-text animated class="skeleton-pill" style="width:68%"></ion-skeleton-text>
                </div>
              </div>
            }
          </div>
        } @else if (data) {
          <section class="status-hero">
            <div class="status-hero-main">
              <app-iba-ring [value]="data.averageWelfareIndex" [level]="averageLevel" caption="IBA medio" [size]="156" />
              <div class="status-hero-copy">
                <p class="page-kicker">{{ firstName }}</p>
                <h1 class="display status-title">{{ headline }}</h1>
                <p class="status-meta">{{ data.evaluatedCount }} de {{ data.animalCount }} evaluados · {{ data.farmCount }} predios</p>
                <div class="status-pills">
                  <span class="tag tag-bad">{{ data.nonCompliantCount }} fuera</span>
                  <span class="tag tag-warn">{{ data.attentionCount }} atención</span>
                  @if (data.unevaluatedCount) {
                    <span class="tag">{{ data.unevaluatedCount }} sin IBA</span>
                  }
                  <span class="tag">{{ data.openAlertCount }} alertas</span>
                </div>
              </div>
            </div>
            @if (data.priorityAnimal; as priority) {
              <a class="priority-action" [routerLink]="priority.record ? ['/app/animals', priority.animal.id] : ['/app/animals', priority.animal.id, 'welfare']">
                <div>
                  <p class="page-kicker">Prioridad</p>
                  <strong>{{ priority.animal.tagId }}</strong>
                  <p class="muted">
                    {{ species[priority.animal.species] }} · {{ priority.farm.name }}
                    @if (priority.record) { · IBA {{ priority.record.welfareIndex }} }
                    @else { · sin evaluación }
                  </p>
                </div>
                <span class="priority-cta">{{ priority.record ? 'Revisar' : 'Evaluar' }}</span>
              </a>
            }
          </section>

          <div class="action-strip">
            <a routerLink="/app/animals" class="action-chip">Inventario</a>
            <a routerLink="/app/animals/new" class="action-chip">Alta animal</a>
            <a routerLink="/app/simulation" class="action-chip">Simular</a>
            <a routerLink="/app/reports" class="action-chip">Reporte</a>
          </div>

          @if (data.evaluatedCount > 0 || data.animalCount > 0) {
            <div class="dashboard-charts">
              <section class="panel">
                <h2 class="panel-title">Semáforo ICA</h2>
                <p class="chart-panel-lead">Distribución de cumplimiento del inventario evaluado.</p>
                <div class="chart-frame"><canvas #complianceCanvas></canvas></div>
                <div class="chart-legend">
                  <span class="chart-legend-item"><span class="chart-legend-swatch" style="background:#30d158"></span>Cumple</span>
                  <span class="chart-legend-item"><span class="chart-legend-swatch" style="background:#ff9f0a"></span>Atención</span>
                  <span class="chart-legend-item"><span class="chart-legend-swatch" style="background:#ff3b30"></span>No cumple</span>
                </div>
              </section>
              <section class="panel">
                <h2 class="panel-title">Especies</h2>
                <p class="chart-panel-lead">Composición del lote bajo monitoreo.</p>
                <div class="chart-frame"><canvas #speciesCanvas></canvas></div>
              </section>
            </div>
          }

          <section class="panel">
            <div class="spread">
              <h2 class="panel-title">Cola de riesgo</h2>
              <ion-button fill="clear" routerLink="/app/animals">Inventario</ion-button>
            </div>
            @if (data.riskAnimals.length === 0) {
              <app-empty-state icon="checkmark-circle-outline" title="Sin animales en riesgo" hint="Los evaluados están en umbral de cumplimiento." />
            } @else {
              @for (item of data.riskAnimals; track item.animal.id) {
                <a class="animal-row list-card risk-row" [routerLink]="['/app/animals', item.animal.id]">
                  <app-species-mark [species]="item.animal.species" />
                  <div class="list-card-copy">
                    <strong>{{ item.animal.tagId }}</strong>
                    <p class="muted">{{ species[item.animal.species] }} · {{ item.farm.name }} · {{ heat[store.heatFor(item.animal, item.record)] }}</p>
                    <div class="iba-track">
                      <span [class]="ibaFill(item.record.complianceLevel)" [style.width.%]="item.record.welfareIndex"></span>
                    </div>
                  </div>
                  <span [class]="complianceClass(item.record.complianceLevel)">{{ compliance[item.record.complianceLevel] }} · {{ item.record.welfareIndex }}</span>
                </a>
              }
            }
          </section>

          <section class="panel">
            <h2 class="panel-title">Alertas activas</h2>
            @if (data.recentAlerts.length === 0) {
              <app-empty-state icon="sunny-outline" title="Sin alertas abiertas" hint="Las desviaciones de evaluación aparecen aquí." />
            } @else {
              @for (alert of data.recentAlerts; track alert.id) {
                <article class="alert-card alert-row">
                  <div class="alert-row-main">
                    <div class="spread">
                      <strong>{{ finding[alert.code] || alert.code }}</strong>
                      <span [class]="severityClass(alert.severity)">{{ alert.severity === 'CRITICAL' ? 'Crítico' : alert.severity === 'HIGH' ? 'Alto' : 'Medio' }}</span>
                    </div>
                    <p class="muted">{{ hint[alert.code] }}</p>
                    <p class="muted">{{ alert.createdAt | date:'d MMM, y hh:mm a' }}</p>
                  </div>
                  <div class="alert-row-actions">
                    @if (alert.animalId) {
                      <a class="text-link" [routerLink]="['/app/animals', alert.animalId]">Ver animal</a>
                    }
                    <button type="button" class="text-link" (click)="dismiss(alert.id)">Marcar vista</button>
                  </div>
                </article>
              }
            }
          </section>
        }
      </div>
    </ion-content>
  `
})
export class DashboardPage implements OnInit, AfterViewChecked, OnDestroy {
  @ViewChild('complianceCanvas') complianceCanvas?: ElementRef<HTMLCanvasElement>;
  @ViewChild('speciesCanvas') speciesCanvas?: ElementRef<HTMLCanvasElement>;
  loading = true;
  data: DashboardData | null = null;
  firstName = '';
  private complianceChart: Chart | null = null;
  private speciesChart: Chart | null = null;
  private chartsDrawn = false;
  readonly species = SPECIES_LABEL;
  readonly compliance = COMPLIANCE_LABEL;
  readonly heat = HEAT_LABEL;
  readonly finding = FINDING_LABEL;
  readonly hint = ALERT_HINT;
  readonly complianceClass = complianceClass;
  readonly ibaFill = ibaFill;
  readonly severityClass = severityClass;

  constructor(readonly store: StoreService, private readonly auth: AuthService) {}

  get averageLevel(): ComplianceLevel | null {
    if (!this.data || !this.data.evaluatedCount) return null;
    if (this.data.averageWelfareIndex >= 80) return 'COMPLIANT';
    if (this.data.averageWelfareIndex >= 60) return 'ATTENTION';
    return 'NON_COMPLIANT';
  }

  get headline(): string {
    if (!this.data) return '';
    if (!this.data.animalCount) return 'Sin inventario activo';
    if (this.data.nonCompliantCount) return `${this.data.nonCompliantCount} fuera de umbral`;
    if (this.data.attentionCount) return `${this.data.attentionCount} requieren atención`;
    if (this.data.unevaluatedCount) return `${this.data.unevaluatedCount} sin evaluación`;
    if (this.data.openAlertCount) return `${this.data.openAlertCount} alertas abiertas`;
    return 'Operación dentro de umbral';
  }

  async ngOnInit(): Promise<void> {
    this.firstName = this.auth.requireUser().fullName.split(' ')[0];
    await this.reload();
  }

  ngAfterViewChecked(): void {
    if (!this.loading && this.data && !this.chartsDrawn) {
      this.drawCharts();
    }
  }

  ngOnDestroy(): void {
    this.complianceChart?.destroy();
    this.speciesChart?.destroy();
  }

  async dismiss(alertId: string): Promise<void> {
    await this.store.acknowledge(alertId);
    await this.reload();
  }

  private async reload(): Promise<void> {
    this.chartsDrawn = false;
    this.complianceChart?.destroy();
    this.speciesChart?.destroy();
    this.complianceChart = null;
    this.speciesChart = null;
    this.data = await this.store.dashboard();
    this.loading = false;
  }

  private drawCharts(): void {
    if (!this.data || this.chartsDrawn) return;
    const complianceCanvas = this.complianceCanvas?.nativeElement;
    const speciesCanvas = this.speciesCanvas?.nativeElement;
    if (!complianceCanvas || !speciesCanvas) return;
    this.chartsDrawn = true;

    const compliant = this.data.compliance.find((row) => row.level === 'COMPLIANT')?.count ?? 0;
    const attention = this.data.compliance.find((row) => row.level === 'ATTENTION')?.count ?? 0;
    const nonCompliant = this.data.compliance.find((row) => row.level === 'NON_COMPLIANT')?.count ?? 0;
    const unevaluated = this.data.unevaluatedCount;

    this.complianceChart = new Chart(complianceCanvas, {
      type: 'doughnut',
      data: {
        labels: ['Cumple', 'Atención', 'No cumple', 'Sin IBA'],
        datasets: [{
          data: [compliant, attention, nonCompliant, unevaluated],
          backgroundColor: ['#30d158', '#ff9f0a', '#ff3b30', '#c7c7cc'],
          borderWidth: 0,
          hoverOffset: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '68%',
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (item) => ` ${item.label}: ${item.raw}` } }
        }
      }
    });

    this.speciesChart = new Chart(speciesCanvas, {
      type: 'bar',
      data: {
        labels: this.data.species.map((row) => SPECIES_LABEL[row.species]),
        datasets: [{
          data: this.data.species.map((row) => row.count),
          backgroundColor: ['#ff9f0a', '#af52de', '#30d158'],
          borderRadius: 10,
          borderSkipped: false,
          maxBarThickness: 42
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false }, ticks: { color: '#86868B', font: { size: 12 } } },
          y: {
            beginAtZero: true,
            ticks: { stepSize: 1, color: '#86868B', font: { size: 12 } },
            grid: { color: 'rgba(60,60,67,0.08)' }
          }
        }
      }
    });
  }
}
