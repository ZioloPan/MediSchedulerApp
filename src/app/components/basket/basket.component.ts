import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';

import { Appointment } from '../../model/Appointment';
import { AppointmentService } from '../../service/appointment.service';

@Component({
  selector: 'app-basket',
  templateUrl: './basket.component.html',
  styleUrls: ['./basket.component.css'],
  imports: [
    CommonModule, 
    MatCardModule, 
    MatDividerModule, 
    MatCheckboxModule, 
    MatButtonModule,
    MatTableModule
  ],
})
export class BasketComponent implements OnInit {
  selectedAppointments: Appointment[] = [];
  displayedColumns: string[] = ['name', 'type', 'date', 'isPayed', 'select'];

  ngOnInit(): void {
    this.getAllAppointments();
  }

  constructor(
    @Inject(MAT_DIALOG_DATA) public appointments: Appointment[],
    private dialogRef: MatDialogRef<BasketComponent>,
    private appointmentService: AppointmentService
  ) {}

  toggleSelection(appointment: Appointment): void {
    if (this.selectedAppointments.includes(appointment)) {
      this.selectedAppointments = this.selectedAppointments.filter((apt) => apt !== appointment);
    } else {
      this.selectedAppointments.push(appointment);
    }
  }

  payForAppointments(): void {
    if (this.selectedAppointments.length === 0) {
      console.warn('No appointments selected for payment.');
      return;
    }
  
    const updateRequests = this.selectedAppointments.map((appointment) => {
      appointment.isPayed = true; 
      return this.appointmentService.update(appointment).toPromise(); 
    });
  
    Promise.all(updateRequests)
      .then((results) => {
        this.dialogRef.close(); 
      })
      .catch((err) => {
        console.error('Failed to update some appointments:', err);
      });
  }
  

  getAllAppointments(): void {
    this.appointmentService.getAll().subscribe(data => this.appointments = data);
  }

  close(): void {
    this.dialogRef.close();
  }
}
