import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Appointment, ConsultationType } from '../../model/Appointment';
import { AppointmentService } from '../../service/appointment.service';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Inject } from '@angular/core';
import { Availability } from '../../model/Availability';
import { MatCardModule } from '@angular/material/card';

@Component({
  standalone: true,
  selector: 'app-add-appointment',
  imports: [
    CommonModule, 
    FormsModule, 
    MatButtonModule, 
    MatInputModule, 
    MatSelectModule,
    MatCardModule
  ],
  templateUrl: './add-appointment.component.html',
  styleUrls: ['./add-appointment.component.css']
})
export class AddAppointmentComponent {
  appointment: Appointment;

  consultationTypes = Object.values(ConsultationType);
  availableEndTimes: string[] = []; 

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { day: string; slot: string; availabilities: Availability[]; appointments: Appointment[] },
    private dialogRef: MatDialogRef<AddAppointmentComponent>,
    private appointmentService: AppointmentService
  ) {
    this.appointment = {
      date: data.day, 
      startTime: data.slot,
      endTime: '',
      type: ConsultationType.FIRST_VISIT,
      firstName: '',
      lastName: '',
      age: 0,
      gender: 'Male',
      notes: '',
    };

    this.calculateAvailableEndTimes();
  }

  calculateAvailableEndTimes(): void {
    if (!this.data.availabilities) {
      console.error('No availabilities provided.');
      return;
    }

    const selectedStartTime = this.appointment.startTime;
    const selectedDate = this.appointment.date;
    const availabilities = this.data.availabilities;
    const appointments = this.data.appointments || []; 

    const timeToMinutes = (time: string): number => {
      const [hours, minutes] = time.split(':').map(Number);
      return hours * 60 + minutes;
    };

    const startTimeInMinutes = timeToMinutes(selectedStartTime);

    const matchingAvailability = availabilities.find((avail) => {
      const startDate = new Date(avail.startDate);
      const endDate = avail.endDate ? new Date(avail.endDate) : null;

      const isDateInRange = new Date(selectedDate) >= startDate && (!endDate || new Date(selectedDate) <= endDate);

      const dayOfWeek = new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long' }) as 
        'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

      const isDayMatch = avail.type === 'RECURRING'
        ? avail.daysOfWeek?.includes(dayOfWeek)
        : true;

      return isDateInRange && isDayMatch;
    });

    if (!matchingAvailability) {
      console.warn('No matching availability found for the selected date.');
      return;
    }

    const availabilityStartTime = timeToMinutes(matchingAvailability.startTime);
    const availabilityEndTime = timeToMinutes(matchingAvailability.endTime);

    let maxEndTime = availabilityEndTime;

    const conflictingAppointment = appointments.find((appointment) => {
      const appointmentDate = new Date(appointment.date).toDateString();
      if (appointmentDate !== new Date(selectedDate).toDateString()) return false;

      const appointmentStartTime = timeToMinutes(appointment.startTime);
      return appointmentStartTime > startTimeInMinutes;
    });

    if (conflictingAppointment) {
      maxEndTime = Math.min(maxEndTime, timeToMinutes(conflictingAppointment.startTime));
    }

    const durations = [30, 60, 90, 120, 150, 180, 210, 240];
    this.availableEndTimes = durations
      .map((duration) => startTimeInMinutes + duration)
      .filter((endTime) => endTime <= maxEndTime)
      .map((endTime) => {
        const hours = Math.floor(endTime / 60).toString().padStart(2, '0');
        const minutes = (endTime % 60).toString().padStart(2, '0');
        return `${hours}:${minutes}`;
      });

    if (this.availableEndTimes.length > 0) {
      this.appointment.endTime = this.availableEndTimes[0];
    }
  }

  save(): void {
    const date = new Date(this.appointment.date);
    date.setDate(date.getDate() + 1); 
  
    const appointmentToSave = {
      ...this.appointment,
      date: date.toISOString().split('T')[0], 
    };
  
    this.appointmentService.add(appointmentToSave).subscribe({
      next: (newAppointment) => {
        console.log('Appointment saved successfully:', newAppointment);
        this.dialogRef.close(newAppointment);
      },
      error: (err) => {
        console.error('Failed to add appointment:', err);
      },
    });
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
