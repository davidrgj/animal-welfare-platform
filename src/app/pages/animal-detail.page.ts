import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { IonButton, IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { Animal, ComplianceFinding, Farm, WelfareRecord } from '../core/models';
import { COMPLIANCE_LABEL, DOMAIN_LABEL, FINDING_LABEL, HEAT_LABEL, PURPOSE_LABEL, SPECIES_LABEL, complianceClass, ibaFill, speciesMark } from '../core/labels';
import { StoreService } from '../core/store.service';
import { EmptyStateComponent } from '../shared/empty-state.component';

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
          <section class="hero-card">
            <div class="spread">
              <div>
                <p class="page-kicker">{{ species[animal.species] }}</p>
                <h1 class="display auth-title">{{ animal.tagId }}</h1>
              </div>
              <span [class]="speciesMark(animal.species) + ' species-mark-lg'">{{ species[animal.species].charAt(0) }}</span>
            </div>
            <p class="muted">{{ animal.breed }} · {{ purpose[animal.purpose] }} · {{ farm.name }}</p>
            <div class="stat-pair">
              <div>
                <span>Peso actual</span>
                <strong>{{ animal.currentWeightKg }} kg</strong>
              </div>
              <div>
                <span>Nacimiento</span>
                <strong>{{ animal.birthDate | date:'d MMM, y' }}</strong>
              </div>
            </div>
            <div class="row action-row">
              <ion-button routerLink="edit">Editar ficha</ion-button>
              <ion-button fill="outline" [routerLink]="['/app/animals', animal.id, 'welfare']">Nueva evaluación</ion-button>
            </div>
          </section>
          <section class="panel">
            <h2 class="panel-title">Historial de bienestar</h2>
            @if (records.length === 0) {
              <app-empty-state icon="clipboard-outline" title="Sin evaluaciones" hint="Captura las cinco libertades para calcular el índice ICA." />
            } @else {
              @for (record of records; track record.id) {
                <article class="animal-row record-card">
                  <div class="spread">
                    <strong class="display panel-title">IBA {{ record.welfareIndex }}</strong>
                    <span [class]="complianceClass(record.complianceLevel)">{{ compliance[record.complianceLevel] }}</span>
                  </div>
                  <div class="iba-track">
                    <span [class]="ibaFill(record.complianceLevel)" [style.width.%]="record.welfareIndex"></span>
                  </div>
                  <p class="muted">{{ record.recordedAt | date:'d MMM, y hh:mm a' }} · THI {{ record.temperatureHumidityIndex }} · {{ heat[store.heatFor(animal, record)] }}</p>
                  <div class="domain-meter"><span>Nutrición</span><div class="iba-track"><span class="iba-fill" [style.width.%]="record.nutritionScore"></span></div><b>{{ record.nutritionScore }}</b></div>
                  <div class="domain-meter"><span>Entorno</span><div class="iba-track"><span class="iba-fill" [style.width.%]="record.environmentScore"></span></div><b>{{ record.environmentScore }}</b></div>
                  <div class="domain-meter"><span>Salud</span><div class="iba-track"><span class="iba-fill" [style.width.%]="record.healthScore"></span></div><b>{{ record.healthScore }}</b></div>
                  <div class="domain-meter"><span>Conducta</span><div class="iba-track"><span class="iba-fill" [style.width.%]="record.behaviorScore"></span></div><b>{{ record.behaviorScore }}</b></div>
                  <div class="domain-meter"><span>Mental</span><div class="iba-track"><span class="iba-fill" [style.width.%]="record.mentalScore"></span></div><b>{{ record.mentalScore }}</b></div>
                  <div class="finding-wrap">
                    @for (finding of findings.get(record.id) || []; track finding.id) {
                      <span class="tag">{{ domains[finding.domain] }}: {{ findingLabel[finding.code] }}</span>
                    }
                  </div>
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
  readonly speciesMark = speciesMark;
  readonly ibaFill = ibaFill;

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
