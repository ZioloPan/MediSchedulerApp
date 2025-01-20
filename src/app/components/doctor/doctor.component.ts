import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { CalendarComponent } from '../calendar/calendar.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { AppointmentService } from '../../service/appointment.service';
import { AvailabilityService } from '../../service/availability.service';
import { Appointment } from '../../model/Appointment';
import { Availability } from '../../model/Availability';
import { AddAvailabilityComponent } from '../add-availability/add-availability.component';

@Component({
  standalone: true,
  selector: 'app-doctor',
  templateUrl: './doctor.component.html',
  imports: [
    CommonModule, 
    MatButtonModule,
    CalendarComponent,
    MatDialogModule
  ],
  styleUrls: ['./doctor.component.css'],
})
export class DoctorComponent implements OnInit {
  appointments: Appointment[] = [];
  availabilities: Availability[] = [];

  constructor(
    private appointmentService: AppointmentService,
    private availabilityService: AvailabilityService,
    private dialog: MatDialog
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

  addAvailability(): void {
    const dialogRef = this.dialog.open(AddAvailabilityComponent, {
      width: '50%',
      exitAnimationDuration: '1000ms',
      enterAnimationDuration: '1000ms'
    });
  
    dialogRef.afterClosed().subscribe((result: Availability | undefined) => {
      if (result) {
        this.availabilities.push(result);
      }
    });
  }
}
