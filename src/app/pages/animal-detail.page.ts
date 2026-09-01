import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { IonButton, IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { Animal, Farm, WelfareRecord } from '../core/models';
import { COMPLIANCE_LABEL, DOMAIN_LABEL, FINDING_LABEL, HEAT_LABEL, PURPOSE_LABEL, SPECIES_LABEL, complianceClass } from '../core/labels';
import { StoreService } from '../core/store.service';
import { EmptyStateComponent } from '../shared/empty-state.component';
import { ComplianceFinding } from '../core/models';

@Component({
  selector: 'app-animal-detail',
  standalone: true,
  imports: [DatePipe, RouterLink, IonButton, IonContent, IonHeader, IonTitle, IonToolbar, EmptyStateComponent],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>{{ animal?.tagId || 'Animal' }}</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      @if (animal && farm) {
        <div class="page-body stack">
          <section class="panel">
            <p class="page-kicker">{{ species[animal.species] }}</p>
            <h1 class="display" style="margin:0">{{ animal.tagId }}</h1>
            <p class="muted">{{ animal.breed }} · {{ purpose[animal.purpose] }} · {{ animal.currentWeightKg }} kg</p>
            <p class="muted">{{ farm.name }} · nacido {{ animal.birthDate | date:'d MMM, y' }}</p>
            <div class="row" style="margin-top:12px">
              <ion-button routerLink="edit">Editar ficha</ion-button>
              <ion-button fill="outline" [routerLink]="['/app/animals', animal.id, 'welfare']">Nueva evaluación</ion-button>
            </div>
          </section>
          <section class="panel">
            <h2 class="display" style="margin:0 0 8px;font-size:1.2rem">Historial de bienestar</h2>
            @if (records.length === 0) {
              <app-empty-state icon="clipboard-outline" title="Sin evaluaciones" hint="Captura las cinco libertades para calcular el índice ICA." />
            } @else {
              @for (record of records; track record.id) {
                <article class="animal-row">
                  <div class="spread">
                    <strong>IBA {{ record.welfareIndex }}</strong>
                    <span [class]="complianceClass(record.complianceLevel)">{{ compliance[record.complianceLevel] }}</span>
                  </div>
                  <p class="muted">{{ record.recordedAt | date:'d MMM, y hh:mm a' }} · THI {{ record.temperatureHumidityIndex }} · {{ heat[store.heatFor(animal, record)] }}</p>
                  <p class="muted">Nutrición {{ record.nutritionScore }} · Entorno {{ record.environmentScore }} · Salud {{ record.healthScore }}</p>
                  @for (finding of findings.get(record.id) || []; track finding.id) {
                    <span class="tag">{{ domains[finding.domain] }}: {{ findingLabel[finding.code] }}</span>
                  }
                </article>
              }
            }
          </section>
          <ion-button fill="outline" color="danger" (click)="remove()">Eliminar animal</ion-button>
        </div>
      }
    </ion-content>
  `
})
export class AnimalDetailPage implements OnInit {
  animal: Animal | null = null;
  farm: Farm | null = null;
  records: WelfareRecord[] = [];
  findings = new Map<string, ComplianceFinding[]>();
  readonly species = SPECIES_LABEL;
  readonly purpose = PURPOSE_LABEL;
  readonly compliance = COMPLIANCE_LABEL;
  readonly heat = HEAT_LABEL;
  readonly domains = DOMAIN_LABEL;
  readonly findingLabel = FINDING_LABEL;
  readonly complianceClass = complianceClass;

  constructor(readonly store: StoreService, private readonly route: ActivatedRoute, private readonly router: Router) {}

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    this.animal = await this.store.animal(id);
    this.farm = await this.store.farm(this.animal.farmId);
    this.records = await this.store.recordsForAnimal(id);
    for (const record of this.records) {
      this.findings.set(record.id, await this.store.findings(record.id));
    }
  }

  async remove(): Promise<void> {
    if (!this.animal) return;
    await this.store.deleteAnimal(this.animal.id);
    await this.router.navigateByUrl('/app/animals');
  }
}
