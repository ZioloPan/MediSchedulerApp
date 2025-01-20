import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { importProvidersFrom } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';

import { MatCardModule } from '@angular/material/card';
import { MatNativeDateModule } from '@angular/material/core';

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(HttpClientModule, MatCardModule, MatNativeDateModule), // Rejestracja HttpClientModule
    provideAnimations(), // Rejestracja animacji
    provideRouter(routes), // Rejestracja tras
  ],
}).catch((err) => console.error(err));
