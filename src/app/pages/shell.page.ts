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
      position: relative;
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      margin: 0 14px calc(12px + env(safe-area-inset-bottom));
      padding: 6px;
      border-radius: 24px;
      background: linear-gradient(180deg, #1a3a2c, #07140f);
      border: 1px solid rgba(226, 181, 106, 0.22);
      box-shadow: 0 18px 40px rgba(7, 20, 15, 0.4);
      z-index: 8;
    }
    .tab-bar a {
      display: grid;
      justify-items: center;
      gap: 4px;
      text-decoration: none;
      color: #c3d0c0;
      font-size: 0.68rem;
      font-weight: 500;
      padding: 9px 4px 8px;
      border-radius: 18px;
    }
    .tab-bar a.tab-selected {
      color: #10261d;
      background: linear-gradient(180deg, #f0c57a, #d4a04e);
      box-shadow: 0 8px 16px rgba(226, 181, 106, 0.32);
      font-weight: 600;
    }
    .tab-bar ion-icon { font-size: 1.22rem; }
  `]
})
export class ShellPage {}
