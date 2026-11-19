import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonButton, IonButtons, IonContent, IonHeader, IonSkeletonText, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { Farm } from '../core/models';
import { WATER_LABEL } from '../core/labels';
import { StoreService } from '../core/store.service';
import { AccountMenuComponent } from '../shared/account-menu.component';
import { EmptyStateComponent } from '../shared/empty-state.component';
import { SpeciesMarkComponent } from '../shared/species-mark.component';

@Component({
  selector: 'app-farms',
  standalone: true,
  imports: [RouterLink, IonButton, IonButtons, IonContent, IonHeader, IonSkeletonText, IonTitle, IonToolbar, AccountMenuComponent, EmptyStateComponent, SpeciesMarkComponent],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Predios</ion-title>
        <ion-buttons slot="end">
          <ion-button fill="clear" routerLink="/app/farms/new">Nuevo</ion-button>
        </ion-buttons>
        <app-account-menu></app-account-menu>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <div class="page-body stack">
        @if (loading) {
          <section class="hero-card skeleton-surface" style="padding:20px">
            <ion-skeleton-text animated class="skeleton-pill" style="width:40%"></ion-skeleton-text>
            <ion-skeleton-text animated class="skeleton-block" style="height:36px;margin-top:12px"></ion-skeleton-text>
          </section>
          <div class="skeleton-list">
            @for (row of [1, 2, 3]; track row) {
              <div class="farm-card skeleton-surface" style="padding:18px">
                <ion-skeleton-text animated class="skeleton-pill" style="width:55%"></ion-skeleton-text>
                <ion-skeleton-text animated class="skeleton-block" style="height:48px;margin-top:14px"></ion-skeleton-text>
              </div>
            }
          </div>
        } @else {
          <section class="hero-card hero-ink">
            <p class="page-kicker">Unidades productivas</p>
            <h1 class="display section-title">{{ farms.length }} predios</h1>
            <p class="status-meta">RUV, agua y georreferencia por lote</p>
          </section>
          @if (farms.length === 0) {
            <app-empty-state icon="leaf-outline" title="Sin predios" hint="Crea el primer predio para vincular el inventario animal." />
          } @else {
            @for (farm of farms; track farm.id) {
              <a class="farm-card farm-card-rich" [routerLink]="['/app/farms', farm.id]">
                <div class="spread">
                  <div>
                    <p class="page-kicker">{{ farm.municipality }}, {{ farm.department }}</p>
                    <h2 class="display panel-title">{{ farm.name }}</h2>
                  </div>
                  <app-species-mark kind="farm" />
                </div>
                <div class="stat-pair">
                  <div>
                    <span>Extensión</span>
                    <strong>{{ farm.hectares }} ha</strong>
                  </div>
                  <div>
                    <span>Agua</span>
                    <strong>{{ water[farm.waterSource] }}</strong>
                  </div>
                </div>
                <p class="muted">RUV {{ farm.vaccinationRegistry }} · {{ farm.latitude }}, {{ farm.longitude }}</p>
              </a>
            }
          }
        }
      </div>
    </ion-content>
  `
})
export class FarmsPage implements OnInit {
  loading = true;
  farms: Farm[] = [];
  readonly water = WATER_LABEL;
  constructor(private readonly store: StoreService) {}
  async ngOnInit(): Promise<void> {
    this.farms = await this.store.farms();
    this.loading = false;
  }
}
