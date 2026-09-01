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
      <nav class="tab-bar" aria-label="Secciones">
        <a routerLink="/app/dashboard" routerLinkActive="tab-selected" [routerLinkActiveOptions]="{exact: true}">
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
    .shell {
      min-height: 100%;
      display: grid;
      grid-template-rows: 1fr auto;
    }
    .shell-page { min-height: 0; }
    .tab-bar {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      padding: 4px 0 calc(6px + env(safe-area-inset-bottom));
      background: rgba(249, 249, 249, 0.86);
      backdrop-filter: saturate(180%) blur(20px);
      border-top: 0.5px solid rgba(60, 60, 67, 0.18);
      z-index: 8;
    }
    .tab-bar a {
      display: grid;
      justify-items: center;
      gap: 2px;
      text-decoration: none;
      color: #8e8e93;
      font-size: 10px;
      font-weight: 500;
      padding: 6px 2px 4px;
    }
    .tab-bar a.tab-selected {
      color: #007aff;
    }
    .tab-bar ion-icon { font-size: 1.45rem; }
  `]
})
export class ShellPage {}
