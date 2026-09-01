import { registerLocaleData } from '@angular/common';
import localeEsCo from '@angular/common/locales/es-CO';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, withHashLocation } from '@angular/router';
import { LOCALE_ID } from '@angular/core';
import { provideIonicAngular } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { addOutline, alertCircleOutline, analyticsOutline, calendarOutline, cameraOutline, checkmarkCircleOutline, clipboardOutline, cloudOfflineOutline, documentTextOutline, flaskOutline, homeOutline, imagesOutline, leafOutline, locationOutline, logOutOutline, pawOutline, personOutline, pulseOutline, saveOutline, sunnyOutline, thermometerOutline, warningOutline, waterOutline } from 'ionicons/icons';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';

registerLocaleData(localeEsCo);
addIcons({ addOutline, alertCircleOutline, analyticsOutline, calendarOutline, cameraOutline, checkmarkCircleOutline, clipboardOutline, cloudOfflineOutline, documentTextOutline, flaskOutline, homeOutline, imagesOutline, leafOutline, locationOutline, logOutOutline, pawOutline, personOutline, pulseOutline, saveOutline, sunnyOutline, thermometerOutline, warningOutline, waterOutline });

bootstrapApplication(AppComponent, {
  providers: [
    { provide: LOCALE_ID, useValue: 'es-CO' },
    provideIonicAngular({ mode: 'md' }),
    provideRouter(routes, withHashLocation())
  ]
}).catch((error) => console.error(error));
