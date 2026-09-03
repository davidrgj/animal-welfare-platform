import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonButton, IonContent, IonHeader, IonSkeletonText, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { AuthService } from '../core/auth.service';
import { ALERT_HINT, COMPLIANCE_LABEL, FINDING_LABEL, HEAT_LABEL, SPECIES_LABEL, complianceClass, ibaFill, severityClass, speciesMark } from '../core/labels';
import { ComplianceLevel } from '../core/models';
import { DashboardData, StoreService } from '../core/store.service';
import { EmptyStateComponent } from '../shared/empty-state.component';
import { IbaRingComponent } from '../shared/iba-ring.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [DatePipe, RouterLink, IonButton, IonContent, IonHeader, IonSkeletonText, IonTitle, IonToolbar, EmptyStateComponent, IbaRingComponent],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Estado ICA</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <div class="page-body stack">
        @if (loading) {
          <section class="status-hero skeleton-surface">
            <ion-skeleton-text animated class="skeleton-block"></ion-skeleton-text>
          </section>
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
                  <span [class]="speciesMark(item.animal.species)">{{ species[item.animal.species].charAt(0) }}</span>
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
export class DashboardPage implements OnInit {
  loading = true;
  data: DashboardData | null = null;
  firstName = '';
  readonly species = SPECIES_LABEL;
  readonly compliance = COMPLIANCE_LABEL;
  readonly heat = HEAT_LABEL;
  readonly finding = FINDING_LABEL;
  readonly hint = ALERT_HINT;
  readonly complianceClass = complianceClass;
  readonly speciesMark = speciesMark;
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

  async dismiss(alertId: string): Promise<void> {
    await this.store.acknowledge(alertId);
    await this.reload();
  }

  private async reload(): Promise<void> {
    this.data = await this.store.dashboard();
    this.loading = false;
  }
}
