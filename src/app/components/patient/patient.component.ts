import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { CalendarComponent } from '../calendar/calendar.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { Appointment } from '../../model/Appointment';
import { Availability } from '../../model/Availability';
import { Absence } from '../../model/Absence';
import { AppointmentService } from '../../service/appointment.service';
import { AvailabilityService } from '../../service/availability.service';
import { AbsenceService } from '../../service/absence.service';

@Component({
  standalone: true,
  selector: 'app-patient',
  imports: [
    CommonModule, 
    MatButtonModule,
    CalendarComponent,
    MatDialogModule
  ],
  templateUrl: './patient.component.html',
  styleUrl: './patient.component.css'
})
export class PatientComponent implements OnInit {
  appointments: Appointment[] = [];
  availabilities: Availability[] = [];
  absences: Absence[] = [];

  constructor(
    private appointmentService: AppointmentService,
    private availabilityService: AvailabilityService,
    private absenceService: AbsenceService,
  ) {}


  ngOnInit(): void {
    this.getAllAppointments();
    this.getAllAvailabilities();
    this.getAllAbsences();
  }

  // Pobranie wszystkich wizyt
  getAllAppointments(): void {
    this.appointmentService.getAll().subscribe(data => {
      this.appointments = data;
      console.log('Appointments:', this.appointments);
    });
  }

  // Pobranie wszystkich dostępności
  getAllAvailabilities(): void {
    this.availabilityService.getAll().subscribe(data => {
      this.availabilities = data;
      console.log('Availabilities:', this.availabilities);
    });
  }

  getAllAbsences(): void {
    this.absenceService.getAll().subscribe(data => {
      this.absences = data;
      console.log('Absences:', this.absences);
    });
  }
}
