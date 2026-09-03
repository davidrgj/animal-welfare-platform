import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { IonBackButton, IonButton, IonButtons, IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { Animal, ComplianceFinding, Farm, WelfareRecord } from '../core/models';
import { COMPLIANCE_LABEL, DOMAIN_LABEL, FINDING_LABEL, HEAT_LABEL, PURPOSE_LABEL, SPECIES_LABEL, complianceClass, ibaFill, speciesMark } from '../core/labels';
import { StoreService } from '../core/store.service';
import { EmptyStateComponent } from '../shared/empty-state.component';
import { IbaRingComponent } from '../shared/iba-ring.component';

@Component({
  selector: 'app-animal-detail',
  standalone: true,
  imports: [DatePipe, RouterLink, IonBackButton, IonButton, IonButtons, IonContent, IonHeader, IonTitle, IonToolbar, EmptyStateComponent, IbaRingComponent],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/app/animals" text="Atrás"></ion-back-button>
        </ion-buttons>
        <ion-title>{{ animal?.tagId || 'Animal' }}</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      @if (animal && farm) {
        <div class="page-body stack">
          <section class="status-hero detail-hero">
            <div class="status-hero-main">
              @if (latest) {
                <app-iba-ring [value]="latest.welfareIndex" [level]="latest.complianceLevel" caption="IBA" [size]="140" />
              } @else {
                <app-iba-ring [value]="0" caption="Sin IBA" [size]="140" />
              }
              <div class="status-hero-copy">
                <p class="page-kicker">{{ species[animal.species] }} · {{ farm.name }}</p>
                <h1 class="display status-title">{{ animal.tagId }}</h1>
                <p class="status-meta">{{ animal.breed }} · {{ purpose[animal.purpose] }} · {{ animal.currentWeightKg }} kg</p>
                @if (latest) {
                  <div class="status-pills">
                    <span [class]="complianceClass(latest.complianceLevel)">{{ compliance[latest.complianceLevel] }}</span>
                    <span class="tag">THI {{ latest.temperatureHumidityIndex }}</span>
                    <span class="tag">{{ heat[store.heatFor(animal, latest)] }}</span>
                  </div>
                }
              </div>
            </div>
            <div class="detail-actions">
              <ion-button expand="block" [routerLink]="['/app/animals', animal.id, 'welfare']">
                {{ latest ? 'Nueva evaluación' : 'Primera evaluación' }}
              </ion-button>
              <div class="row">
                <ion-button expand="block" fill="outline" routerLink="edit">Editar ficha</ion-button>
                <ion-button expand="block" fill="outline" [routerLink]="['/app/simulation']">Simular</ion-button>
              </div>
            </div>
          </section>

          @if (latest) {
            <section class="panel">
              <h2 class="panel-title">Dominios</h2>
              <div class="domain-meter"><span>Nutrición</span><div class="iba-track"><span class="iba-fill" [style.width.%]="latest.nutritionScore"></span></div><b>{{ latest.nutritionScore }}</b></div>
              <div class="domain-meter"><span>Entorno</span><div class="iba-track"><span class="iba-fill" [style.width.%]="latest.environmentScore"></span></div><b>{{ latest.environmentScore }}</b></div>
              <div class="domain-meter"><span>Salud</span><div class="iba-track"><span class="iba-fill" [style.width.%]="latest.healthScore"></span></div><b>{{ latest.healthScore }}</b></div>
              <div class="domain-meter"><span>Conducta</span><div class="iba-track"><span class="iba-fill" [style.width.%]="latest.behaviorScore"></span></div><b>{{ latest.behaviorScore }}</b></div>
              <div class="domain-meter"><span>Mental</span><div class="iba-track"><span class="iba-fill" [style.width.%]="latest.mentalScore"></span></div><b>{{ latest.mentalScore }}</b></div>
              @if ((findings.get(latest.id) || []).length) {
                <div class="finding-wrap">
                  @for (finding of findings.get(latest.id) || []; track finding.id) {
                    <span class="tag">{{ domains[finding.domain] }}: {{ findingLabel[finding.code] }}</span>
                  }
                </div>
              }
            </section>
          }

          <section class="panel">
            <h2 class="panel-title">Historial</h2>
            @if (records.length === 0) {
              <app-empty-state icon="clipboard-outline" title="Sin evaluaciones" hint="Captura las cinco libertades para calcular el índice ICA." />
            } @else {
              @for (record of records; track record.id) {
                <article class="timeline-item">
                  <div class="spread">
                    <strong>IBA {{ record.welfareIndex }}</strong>
                    <span [class]="complianceClass(record.complianceLevel)">{{ compliance[record.complianceLevel] }}</span>
                  </div>
                  <div class="iba-track">
                    <span [class]="ibaFill(record.complianceLevel)" [style.width.%]="record.welfareIndex"></span>
                  </div>
                  <p class="muted">{{ record.recordedAt | date:'d MMM, y hh:mm a' }} · THI {{ record.temperatureHumidityIndex }}</p>
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

  get latest(): WelfareRecord | null {
    return this.records[0] ?? null;
  }

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
