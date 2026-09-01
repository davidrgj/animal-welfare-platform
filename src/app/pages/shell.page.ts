import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { IonIcon, IonLabel, IonRouterOutlet, IonTabBar, IonTabButton, IonTabs } from '@ionic/angular/standalone';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, IonIcon, IonLabel, IonRouterOutlet, IonTabBar, IonTabButton, IonTabs],
  template: `
    <ion-tabs>
      <ion-router-outlet></ion-router-outlet>
      <ion-tab-bar slot="bottom">
        <ion-tab-button tab="dashboard" routerLink="/app/dashboard" routerLinkActive="tab-selected">
          <ion-icon name="home-outline"></ion-icon>
          <ion-label>Inicio</ion-label>
        </ion-tab-button>
        <ion-tab-button tab="animals" routerLink="/app/animals" routerLinkActive="tab-selected">
          <ion-icon name="paw-outline"></ion-icon>
          <ion-label>Animales</ion-label>
        </ion-tab-button>
        <ion-tab-button tab="farms" routerLink="/app/farms" routerLinkActive="tab-selected">
          <ion-icon name="leaf-outline"></ion-icon>
          <ion-label>Predios</ion-label>
        </ion-tab-button>
        <ion-tab-button tab="simulation" routerLink="/app/simulation" routerLinkActive="tab-selected">
          <ion-icon name="flask-outline"></ion-icon>
          <ion-label>Simulación</ion-label>
        </ion-tab-button>
        <ion-tab-button tab="profile" routerLink="/app/profile" routerLinkActive="tab-selected">
          <ion-icon name="person-outline"></ion-icon>
          <ion-label>Cuenta</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  `
})
export class ShellPage {}
