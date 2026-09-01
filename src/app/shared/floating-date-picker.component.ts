import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IonButton, IonButtons, IonContent, IonDatetime, IonHeader, IonIcon, IonModal, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-floating-date-picker',
  standalone: true,
  imports: [DatePipe, IonButton, IonButtons, IonContent, IonDatetime, IonHeader, IonIcon, IonModal, IonTitle, IonToolbar],
  template: `
    <button class="field-box date-trigger" type="button" (click)="open = true">
      <span class="field-label">{{ label }}</span>
      <strong>{{ value ? (value | date:'d MMM, y') : placeholder }}</strong>
      <ion-icon name="calendar-outline" aria-hidden="true"></ion-icon>
    </button>
    <ion-modal [isOpen]="open" (didDismiss)="open = false" class="date-modal">
      <ng-template>
        <ion-header>
          <ion-toolbar>
            <ion-title>{{ label }}</ion-title>
            <ion-buttons slot="end">
              <ion-button (click)="open = false">Cerrar</ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding">
          <ion-datetime
            presentation="date"
            [value]="value"
            locale="es-CO"
            (ionChange)="pick($event.detail.value)"
          ></ion-datetime>
        </ion-content>
      </ng-template>
    </ion-modal>
  `,
  styles: [`
    .date-trigger {
      width: 100%;
      text-align: left;
      padding: 10px 12px;
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 2px 8px;
      background: var(--paper-strong);
    }
    .date-trigger .field-label { grid-column: 1 / -1; margin: 0; }
    .date-trigger strong { font-weight: 500; }
  `]
})
export class FloatingDatePickerComponent {
  @Input() label = 'Fecha';
  @Input() placeholder = 'Elegir fecha';
  @Input() value = '';
  @Output() valueChange = new EventEmitter<string>();
  open = false;

  pick(value: string | string[] | null | undefined): void {
    const next = Array.isArray(value) ? value[0] : value;
    if (!next) return;
    this.valueChange.emit(next.slice(0, 10));
    this.open = false;
  }
}
