import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { CalendarComponent } from '../calendar/calendar.component';

import { AppointmentService } from '../../service/appointment.service';
import { Appointment } from '../../model/Appointment';

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

  constructor(private appointmentService: AppointmentService) {}

  ngOnInit(): void {
    this.getAllAppointments();
  }

  getAllAppointments(): void {
    this.appointmentService.getAll().subscribe(data => (this.appointments = data));
  }
}
