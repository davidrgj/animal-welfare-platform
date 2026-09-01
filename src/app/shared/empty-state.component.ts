import { Component, Input } from '@angular/core';
import { IonIcon } from '@ionic/angular/standalone';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [IonIcon],
  template: `
    <div class="empty-state">
      <div class="empty-state-icon">
        <ion-icon [name]="icon" aria-hidden="true"></ion-icon>
      </div>
      <p class="empty-state-title">{{ title }}</p>
      <p class="empty-state-hint">{{ hint }}</p>
    </div>
  `
})
export class EmptyStateComponent {
  @Input({ required: true }) icon = 'clipboard-outline';
  @Input({ required: true }) title = '';
  @Input({ required: true }) hint = '';
}
