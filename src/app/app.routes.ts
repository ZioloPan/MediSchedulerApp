import { Routes } from '@angular/router';
import { DoctorComponent } from './components/doctor/doctor.component';
import { PatientComponent } from './components/patient/patient.component';
import { AppComponent } from './app.component';

export const routes: Routes = [
    { path: '', component: AppComponent },
    { path: 'doctor', component: DoctorComponent },
    { path: 'patient', component: PatientComponent },
  ];