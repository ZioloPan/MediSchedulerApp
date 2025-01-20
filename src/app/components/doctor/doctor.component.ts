import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { CalendarComponent } from '../calendar/calendar.component';

import { AppointmentService } from '../../service/appointment.service';
import { AvailabilityService } from '../../service/availability.service';
import { Appointment } from '../../model/Appointment';
import { Availability } from '../../model/Availability';

@Component({
  standalone: true,
  selector: 'app-doctor',
  templateUrl: './doctor.component.html',
  imports: [
    CommonModule, 
    MatButtonModule,
    CalendarComponent
  ],
  styleUrls: ['./doctor.component.css'],
})
export class DoctorComponent implements OnInit {
  appointments: Appointment[] = [];
  availabilities: Availability[] = [];

  constructor(
    private appointmentService: AppointmentService,
    private availabilityService: AvailabilityService
  ) {}

  ngOnInit(): void {
    this.getAllAppointments();
    this.getAllAvailabilities();
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
}
