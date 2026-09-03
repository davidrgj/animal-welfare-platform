import { Component, Input } from '@angular/core';
import { ComplianceLevel } from '../core/models';

@Component({
  selector: 'app-iba-ring',
  standalone: true,
  template: `
    <div class="iba-ring" [class]="tone" [style.--size.px]="size">
      <svg viewBox="0 0 120 120" aria-hidden="true">
        <circle class="iba-ring-track" cx="60" cy="60" r="52" />
        <circle
          class="iba-ring-value"
          cx="60"
          cy="60"
          r="52"
          [attr.stroke-dasharray]="circumference"
          [attr.stroke-dashoffset]="offset"
        />
      </svg>
      <div class="iba-ring-copy">
        <strong>{{ display }}</strong>
        @if (caption) { <span>{{ caption }}</span> }
      </div>
    </div>
  `,
  styles: [`
    :host { display: inline-grid; }
    .iba-ring {
      --size: 148px;
      width: var(--size);
      height: var(--size);
      position: relative;
      display: grid;
      place-items: center;
    }
    svg {
      width: 100%;
      height: 100%;
      transform: rotate(-90deg);
    }
    circle {
      fill: none;
      stroke-width: 8;
      stroke-linecap: round;
    }
    .iba-ring-track { stroke: rgba(60, 60, 67, 0.12); }
    .iba-ring-value {
      stroke: var(--accent);
      transition: stroke-dashoffset 700ms cubic-bezier(0.22, 1, 0.36, 1);
    }
    .iba-ring.ok .iba-ring-value { stroke: var(--ok); }
    .iba-ring.warn .iba-ring-value { stroke: var(--warn); }
    .iba-ring.bad .iba-ring-value { stroke: var(--danger); }
    .iba-ring-copy {
      position: absolute;
      inset: 0;
      display: grid;
      place-content: center;
      text-align: center;
      gap: 2px;
    }
    .iba-ring-copy strong {
      font-size: calc(var(--size) * 0.22);
      font-weight: 700;
      letter-spacing: -0.04em;
      line-height: 1;
      color: var(--ink);
      font-variant-numeric: tabular-nums;
    }
    .iba-ring-copy span {
      font-size: 12px;
      font-weight: 600;
      color: var(--muted);
    }
  `]
})
export class IbaRingComponent {
  @Input() value = 0;
  @Input() caption = 'IBA';
  @Input() size = 148;
  @Input() level: ComplianceLevel | null = null;

  readonly circumference = 2 * Math.PI * 52;

  get display(): string {
    return Number.isFinite(this.value) ? String(Math.round(this.value * 10) / 10) : '—';
  }

  get offset(): number {
    const clamped = Math.max(0, Math.min(100, this.value || 0));
    return this.circumference * (1 - clamped / 100);
  }

  get tone(): string {
    if (this.level === 'COMPLIANT') return 'ok';
    if (this.level === 'ATTENTION') return 'warn';
    if (this.level === 'NON_COMPLIANT') return 'bad';
    if (this.value >= 80) return 'ok';
    if (this.value >= 60) return 'warn';
    if (this.value > 0) return 'bad';
    return '';
  }
}
