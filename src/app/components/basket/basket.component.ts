import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Appointment } from '../../model/Appointment';
import { AppointmentService } from '../../service/appointment.service';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';

@Component({
  selector: 'app-basket',
  templateUrl: './basket.component.html',
  styleUrls: ['./basket.component.css'],
  imports: [CommonModule, 
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
    @Inject(MAT_DIALOG_DATA) public appointments: Appointment[], // Lista wizyt przekazana z `PatientComponent`
    private dialogRef: MatDialogRef<BasketComponent>,
    private appointmentService: AppointmentService
  ) {console.log('BasketComponent initialized.');
    console.log('Appointments passed to dialog:', this.appointments);
  }

  toggleSelection(appointment: Appointment): void {
    console.log('toggleSelection called for:', appointment);
    if (this.selectedAppointments.includes(appointment)) {
      this.selectedAppointments = this.selectedAppointments.filter((apt) => apt !== appointment);
    } else {
      this.selectedAppointments.push(appointment);
    }
    console.log('Selected appointments:', this.selectedAppointments);
  }

  payForAppointments(): void {
    console.log('Selected appointments to update:', this.selectedAppointments);
  
    // Upewnij się, że są wybrane wizyty
    if (this.selectedAppointments.length === 0) {
      console.warn('No appointments selected for payment.');
      return;
    }
  
    // Aktualizuj wszystkie zaznaczone wizyty
    const updateRequests = this.selectedAppointments.map((appointment) => {
      appointment.isPayed = true; // Ustaw isPayed na true
      console.log('Updating appointment:', appointment);
      return this.appointmentService.update(appointment).toPromise(); // Wywołanie metody aktualizacji
    });
  
    Promise.all(updateRequests)
      .then((results) => {
        console.log('All selected appointments updated successfully:', results);
        this.dialogRef.close(); // Zamknij dialog po aktualizacji
      })
      .catch((err) => {
        console.error('Failed to update some appointments:', err);
      });
  }
  

  getAllAppointments(): void {
    this.appointmentService.getAll().subscribe(data => {
      this.appointments = data;
      console.log('Appointments:', this.appointments);
    });
  }

  close(): void {
    this.dialogRef.close();
  }

}
