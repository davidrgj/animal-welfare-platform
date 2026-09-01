import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonButton, IonContent, IonHeader, IonSkeletonText, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { AuthService } from '../core/auth.service';
import { ALERT_HINT, COMPLIANCE_LABEL, FINDING_LABEL, HEAT_LABEL, SPECIES_LABEL, complianceClass, ibaFill, speciesMark } from '../core/labels';
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
          <p class="page-kicker">Panel de bienestar</p>
          <h1 class="display auth-title">Hola, {{ firstName }}</h1>
          <p class="page-lead">Predios, animales y riesgos ICA en un solo índice.</p>
        </section>
        @if (loading) {
          <div class="kpi-grid">
            @for (tile of [1,2,3,4]; track tile) {
              <div class="kpi-tile skeleton-surface">
                <ion-skeleton-text animated class="skeleton-pill"></ion-skeleton-text>
                <ion-skeleton-text animated></ion-skeleton-text>
              </div>
            }
          </div>
        } @else if (data) {
          <div class="kpi-grid">
            <article class="kpi-tile kpi-index">
              <p class="kpi-tile-label">Índice medio</p>
              <p class="kpi-tile-value">{{ data.averageWelfareIndex }}</p>
              <div class="iba-track"><span class="iba-fill" [style.width.%]="data.averageWelfareIndex"></span></div>
            </article>
            <article class="kpi-tile">
              <p class="kpi-tile-label">Animales</p>
              <p class="kpi-tile-value">{{ data.animalCount }}</p>
              <p class="kpi-tile-foot">{{ data.farmCount }} predios activos</p>
            </article>
            <article class="kpi-tile kpi-alert">
              <p class="kpi-tile-label">Alertas abiertas</p>
              <p class="kpi-tile-value">{{ data.openAlertCount }}</p>
              <p class="kpi-tile-foot">Sanidad, calor y densidad</p>
            </article>
            <article class="kpi-tile kpi-bad">
              <p class="kpi-tile-label">No cumple ICA</p>
              <p class="kpi-tile-value">{{ data.nonCompliantCount }}</p>
              <p class="kpi-tile-foot">Umbral IBA menor a 60</p>
            </article>
          </div>
          <section class="panel">
            <div class="spread">
              <h2 class="panel-title">Riesgos activos</h2>
              <ion-button fill="clear" routerLink="/app/animals">Ver inventario</ion-button>
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
            <h2 class="panel-title">Alertas</h2>
            @if (data.recentAlerts.length === 0) {
              <app-empty-state icon="sunny-outline" title="Sin alertas abiertas" hint="Cuando un registro rompa un criterio ICA, aparecerá aquí." />
            } @else {
              @for (alert of data.recentAlerts; track alert.id) {
                <article class="alert-card">
                  <strong>{{ finding[alert.code] || alert.code }}</strong>
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

  constructor(readonly store: StoreService, private readonly auth: AuthService) {}

  async ngOnInit(): Promise<void> {
    this.firstName = this.auth.requireUser().fullName.split(' ')[0];
    this.data = await this.store.dashboard();
    this.loading = false;
  }
}
