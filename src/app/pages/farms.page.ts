import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonButton, IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { Farm } from '../core/models';
import { WATER_LABEL } from '../core/labels';
import { StoreService } from '../core/store.service';
import { EmptyStateComponent } from '../shared/empty-state.component';

@Component({
  selector: 'app-farms',
  standalone: true,
  imports: [RouterLink, IonButton, IonContent, IonHeader, IonTitle, IonToolbar, EmptyStateComponent],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Predios</ion-title>
        <ion-button slot="end" fill="clear" routerLink="/app/farms/new">Nueva finca</ion-button>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <div class="page-body stack">
        <p class="page-kicker">Unidades productivas</p>
        <p class="page-lead">Predios georreferenciados, con RUV y fuente de agua.</p>
        @if (farms.length === 0) {
          <app-empty-state icon="leaf-outline" title="Sin predios" hint="Registra la primera finca para empezar el inventario animal." />
        } @else {
          @for (farm of farms; track farm.id) {
            <a class="farm-card" [routerLink]="['/app/farms', farm.id]">
              <p class="page-kicker">{{ farm.municipality }}, {{ farm.department }}</p>
              <h2 class="display panel-title">{{ farm.name }}</h2>
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
              <p class="muted">RUV {{ farm.vaccinationRegistry }} · GPS {{ farm.latitude }}, {{ farm.longitude }}</p>
            </a>
          }
        }
      </div>
    </ion-content>
  `
})
export class FarmsPage implements OnInit {
  farms: Farm[] = [];
  readonly water = WATER_LABEL;
  constructor(private readonly store: StoreService) {}
  async ngOnInit(): Promise<void> {
    this.farms = await this.store.farms();
  }
}
