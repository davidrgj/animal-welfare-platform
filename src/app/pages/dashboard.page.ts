import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonButton, IonContent, IonHeader, IonSkeletonText, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { AuthService } from '../core/auth.service';
import { ALERT_HINT, COMPLIANCE_LABEL, FINDING_LABEL, HEAT_LABEL, SPECIES_LABEL, complianceClass, ibaFill, severityClass, speciesMark } from '../core/labels';
import { DashboardData, StoreService } from '../core/store.service';
import { EmptyStateComponent } from '../shared/empty-state.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [DatePipe, RouterLink, IonButton, IonContent, IonHeader, IonSkeletonText, IonTitle, IonToolbar, EmptyStateComponent],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Inicio</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <div class="page-body stack">
        <section class="hero-card hero-ink">
          <p class="page-kicker">Bienestar animal ICA</p>
          <h1 class="display auth-title">Hola, {{ firstName }}</h1>
          <p class="page-lead">Esta app mira si bovinos, caprinos y porcinos están bien. Primero el predio, luego el animal y al final una evaluación. De ahí sale el IBA, de 0 a 100.</p>
        </section>
        <section class="panel">
          <h2 class="panel-title">Cómo se usa</h2>
          <p class="panel-lead">Sigue este orden. 80 o más cumple; menos de 60 no cumple.</p>
          <ol class="flow-steps">
            <li>
              <a routerLink="/app/farms">
                <span class="flow-num">1</span>
                <strong>Predio</strong>
                <p>La finca, el agua y el registro de vacunación.</p>
              </a>
            </li>
            <li>
              <a routerLink="/app/animals">
                <span class="flow-num">2</span>
                <strong>Animal</strong>
                <p>Chapa, especie y peso de cada ejemplar.</p>
              </a>
            </li>
            <li>
              <a routerLink="/app/animals">
                <span class="flow-num">3</span>
                <strong>Evaluación</strong>
                <p>Comida, calor, salud y manejo. Ahí nace el índice.</p>
              </a>
            </li>
          </ol>
        </section>
        @if (loading) {
          <section class="panel">
            <h2 class="panel-title">Cómo van hoy</h2>
            <div class="summary-grid">
              @for (tile of [1,2,3,4]; track tile) {
                <div class="kpi-tile skeleton-surface">
                  <ion-skeleton-text animated class="skeleton-pill"></ion-skeleton-text>
                  <ion-skeleton-text animated></ion-skeleton-text>
                </div>
              }
            </div>
          </section>
        } @else if (data) {
          <section class="panel">
            <h2 class="panel-title">Cómo van hoy</h2>
            <p class="panel-lead">Un vistazo a predios, animales y el índice medio de las últimas evaluaciones.</p>
            <div class="summary-grid">
              <article class="kpi-tile kpi-index">
                <p class="kpi-tile-label">Índice medio</p>
                <p class="kpi-tile-value">{{ data.averageWelfareIndex }}</p>
                <div class="iba-track"><span class="iba-fill" [style.width.%]="data.averageWelfareIndex"></span></div>
              </article>
              <article class="kpi-tile">
                <p class="kpi-tile-label">Animales</p>
                <p class="kpi-tile-value">{{ data.animalCount }}</p>
                <p class="kpi-tile-foot">{{ data.farmCount }} predios</p>
              </article>
              <article class="kpi-tile kpi-alert">
                <p class="kpi-tile-label">Alertas abiertas</p>
                <p class="kpi-tile-value">{{ data.openAlertCount }}</p>
                <p class="kpi-tile-foot">Calor, vacunas, espacio</p>
              </article>
              <article class="kpi-tile kpi-bad">
                <p class="kpi-tile-label">No cumple</p>
                <p class="kpi-tile-value">{{ data.nonCompliantCount }}</p>
                <p class="kpi-tile-foot">IBA por debajo de 60</p>
              </article>
            </div>
          </section>
          <section class="panel">
            <div class="spread">
              <div>
                <h2 class="panel-title">Hay que atender</h2>
                <p class="panel-lead">Ejemplares que no cumplen. Ábrelos para ver la evaluación o registrar otra.</p>
              </div>
              <ion-button fill="clear" routerLink="/app/animals">Ver todos</ion-button>
            </div>
            @if (data.riskAnimals.length === 0) {
              <app-empty-state icon="checkmark-circle-outline" title="Sin incumplimientos" hint="Los animales evaluados están dentro del umbral ICA." />
            } @else {
              @for (item of data.riskAnimals; track item.animal.id) {
                <a class="animal-row list-card" [routerLink]="['/app/animals', item.animal.id]">
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
            <h2 class="panel-title">Avisos abiertos</h2>
            <p class="panel-lead">Salen de la última evaluación: calor, vacunas, espacio o un IBA bajo.</p>
            @if (data.recentAlerts.length === 0) {
              <app-empty-state icon="sunny-outline" title="Sin alertas abiertas" hint="Cuando un registro rompa un criterio ICA, aparecerá aquí." />
            } @else {
              @for (alert of data.recentAlerts; track alert.id) {
                <article class="alert-card">
                  <div class="spread">
                    <strong>{{ finding[alert.code] || alert.code }}</strong>
                    <span [class]="severityClass(alert.severity)">{{ alert.severity === 'CRITICAL' ? 'Crítico' : alert.severity === 'HIGH' ? 'Alto' : 'Medio' }}</span>
                  </div>
                  <p class="muted">{{ hint[alert.code] }}</p>
                  <p class="muted">{{ alert.createdAt | date:'d MMM, y hh:mm a' }}</p>
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

  async ngOnInit(): Promise<void> {
    this.firstName = this.auth.requireUser().fullName.split(' ')[0];
    this.data = await this.store.dashboard();
    this.loading = false;
  }
}
