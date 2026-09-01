import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { IonIcon } from '@ionic/angular/standalone';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet, IonIcon],
  template: `
    <div class="shell">
      <div class="shell-page">
        <router-outlet></router-outlet>
      </div>
      <nav class="tab-bar">
        <a routerLink="/app/dashboard" routerLinkActive="tab-selected">
          <ion-icon name="home-outline"></ion-icon>
          Inicio
        </a>
        <a routerLink="/app/animals" routerLinkActive="tab-selected">
          <ion-icon name="paw-outline"></ion-icon>
          Animales
        </a>
        <a routerLink="/app/farms" routerLinkActive="tab-selected">
          <ion-icon name="leaf-outline"></ion-icon>
          Predios
        </a>
        <a routerLink="/app/simulation" routerLinkActive="tab-selected">
          <ion-icon name="flask-outline"></ion-icon>
          Simulación
        </a>
        <a routerLink="/app/profile" routerLinkActive="tab-selected">
          <ion-icon name="person-outline"></ion-icon>
          Cuenta
        </a>
      </nav>
    </div>
  `,
  styles: [`
    .shell { min-height: 100%; display: grid; grid-template-rows: 1fr auto; }
    .shell-page { min-height: 0; }
    .tab-bar {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      background: rgba(255, 250, 241, 0.94);
      border-top: 1px solid var(--line);
      padding: 8px 6px 12px;
      position: sticky;
      bottom: 0;
      z-index: 8;
    }
    .tab-bar a {
      display: grid;
      justify-items: center;
      gap: 4px;
      text-decoration: none;
      color: var(--muted);
      font-size: 0.72rem;
    }
    .tab-bar a.tab-selected { color: var(--pine); }
    .tab-bar ion-icon { font-size: 1.25rem; }
  `]
})
export class ShellPage {}
