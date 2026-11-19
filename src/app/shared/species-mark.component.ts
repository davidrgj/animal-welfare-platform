import { Component, Input } from '@angular/core';
import { IonIcon } from '@ionic/angular/standalone';
import { SPECIES_LABEL, speciesMark } from '../core/labels';
import { Species } from '../core/models';

@Component({
  selector: 'app-species-mark',
  standalone: true,
  imports: [IonIcon],
  template: `
    @if (kind === 'farm') {
      <span class="species-mark species-mark-farm" role="img" aria-label="Predio">
        <ion-icon name="leaf-outline" aria-hidden="true"></ion-icon>
      </span>
    } @else if (kind === 'simulation') {
      <span class="species-mark species-mark-sim" role="img" aria-label="Simulación">
        <ion-icon name="flask-outline" aria-hidden="true"></ion-icon>
      </span>
    } @else if (species) {
      <span [class]="markClass" role="img" [attr.aria-label]="label">
        @switch (species) {
          @case ('CATTLE') {
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path fill="currentColor" d="M7.2 4.2c.7-.9 1.9-1.1 2.8-.4L12 5.2l1.9-1.4c.9-.7 2.1-.5 2.8.4l1.5 2c.4.6.4 1.3.1 1.9l-.7 1.2c1.7 1.1 2.9 3 2.9 5.2v1.3c0 2.4-1.9 4.4-4.3 4.6H7.8C5.4 19.2 3.5 17.2 3.5 14.8V13.5c0-2.2 1.2-4.1 2.9-5.2l-.7-1.2c-.3-.6-.3-1.3.1-1.9l1.4-2zm1.6 7.1c-.8 0-1.4.7-1.4 1.5S8 14.3 8.8 14.3s1.4-.7 1.4-1.5-.6-1.5-1.4-1.5zm6.4 0c-.8 0-1.4.7-1.4 1.5s.6 1.5 1.4 1.5 1.4-.7 1.4-1.5-.6-1.5-1.4-1.5zM9.2 17.2h5.6c.4 0 .7.4.5.8-.5 1-1.5 1.6-2.7 1.6h-1.2c-1.2 0-2.2-.6-2.7-1.6-.2-.4.1-.8.5-.8z"/>
            </svg>
          }
          @case ('GOAT') {
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path fill="currentColor" d="M6.2 3.5c.4-.5 1.1-.5 1.5 0L9.8 6c.7-.4 1.5-.6 2.2-.6.8 0 1.6.2 2.3.6l2.1-2.5c.4-.5 1.1-.5 1.5 0 .3.4.3 1 0 1.3L16.2 7.5c1.4 1.1 2.3 2.8 2.3 4.7v1.1c0 2.5-1.9 4.6-4.3 4.9v1.5c0 .5-.4.9-.9.9h-2.6c-.5 0-.9-.4-.9-.9v-1.5c-2.4-.3-4.3-2.4-4.3-4.9V12.2c0-1.9.9-3.6 2.3-4.7L6.2 4.8c-.3-.3-.3-.9 0-1.3zM9.2 11.4c-.7 0-1.2.6-1.2 1.3s.5 1.3 1.2 1.3 1.2-.6 1.2-1.3-.5-1.3-1.2-1.3zm5.6 0c-.7 0-1.2.6-1.2 1.3s.5 1.3 1.2 1.3 1.2-.6 1.2-1.3-.5-1.3-1.2-1.3z"/>
            </svg>
          }
          @case ('SWINE') {
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path fill="currentColor" d="M8.2 5.2c0-1 .8-1.8 1.8-1.8h4c1 0 1.8.8 1.8 1.8v.4c1.9.7 3.2 2.5 3.2 4.6v1.2c0 .7-.2 1.4-.5 2 .8.4 1.3 1.2 1.3 2.1v.8c0 1.1-.9 2-2 2h-1.1c-.4 1.7-1.9 3-3.7 3h-2.8c-1.8 0-3.3-1.3-3.7-3H5.4c-1.1 0-2-.9-2-2v-.8c0-.9.5-1.7 1.3-2-.3-.6-.5-1.3-.5-2V10.2c0-2.1 1.3-3.9 3.2-4.6v-.4zm1.5 6.3c-.7 0-1.2.6-1.2 1.3s.5 1.3 1.2 1.3 1.2-.6 1.2-1.3-.5-1.3-1.2-1.3zm4.6 0c-.7 0-1.2.6-1.2 1.3s.5 1.3 1.2 1.3 1.2-.6 1.2-1.3-.5-1.3-1.2-1.3zM10 16.2h4c.5 0 .9.4.8.9-.2.8-.9 1.4-1.8 1.4h-2c-.9 0-1.6-.6-1.8-1.4-.1-.5.3-.9.8-.9z"/>
            </svg>
          }
        }
      </span>
    }
  `
})
export class SpeciesMarkComponent {
  @Input() species: Species | null = null;
  @Input() kind: 'species' | 'farm' | 'simulation' = 'species';
  @Input() size: 'md' | 'lg' = 'md';

  get label(): string {
    return this.species ? SPECIES_LABEL[this.species] : '';
  }

  get markClass(): string {
    if (!this.species) return 'species-mark';
    return `${speciesMark(this.species)}${this.size === 'lg' ? ' species-mark-lg' : ''}`;
  }
}
