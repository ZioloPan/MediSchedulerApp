import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Appointment } from '../../model/Appointment';
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

  consultationTypes: ('First Visit' | 'Follow-Up Visit' | 'Chronic Condition' | 'Prescription')[] = [
    'First Visit',
    'Follow-Up Visit',
    'Chronic Condition',
    'Prescription',
  ];
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
      type: 'First Visit',
      firstName: '',
      lastName: '',
      age: 0,
      gender: 'Male',
      notes: '',
      isPayed: false
    };
    this.calculateAvailableEndTimes();
  }

  calculateAvailableEndTimes(): void {
    if (!this.data.availabilities) {
      console.error('No availabilities provided.');
      return;
    }
  
    const toLocalDateString = (date: Date): string => {
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      return `${year}-${month}-${day}`; 
    };
  
    const timeToMinutes = (time: string): number => {
      const [hh, mm] = time.split(':').map(Number);
      return hh * 60 + mm;
    };
  
    const selectedDateObj = new Date(this.appointment.date);
    const selectedDateStr = toLocalDateString(selectedDateObj);
    const selectedDayOfWeek = selectedDateObj.toLocaleDateString('en-US', { weekday: 'long' }) as
      'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  
    const startTimeInMinutes = timeToMinutes(this.appointment.startTime);
  
    const filteredAvailabilities = this.data.availabilities.filter((avail) => {
      if (avail.type === 'ONE_TIME') {
        return avail.startDate === selectedDateStr;
      } else {
        if (!avail.daysOfWeek?.includes(selectedDayOfWeek)) return false;
  
        const dateObj = new Date(selectedDateStr);
        const startRangeObj = new Date(avail.startDate);
        if (dateObj < startRangeObj) return false;
  
        if (avail.endDate) {
          const endRangeObj = new Date(avail.endDate);
          if (dateObj > endRangeObj) return false;
        }
  
        return true;
      }
    });
  
    const coveringAvailabilities = filteredAvailabilities.filter((avail) => {
      const availStart = timeToMinutes(avail.startTime);
      const availEnd = timeToMinutes(avail.endTime);
      return startTimeInMinutes >= availStart && startTimeInMinutes < availEnd;
    });
  
    if (coveringAvailabilities.length === 0) {
      this.availableEndTimes = [];
      this.appointment.endTime = '';
      return;
    }
  
    const matchingAvailability = coveringAvailabilities[0];
  
    let maxEndTime = timeToMinutes(matchingAvailability.endTime);
  
    const sameDayAppointments = (this.data.appointments || []).filter((apt) =>
      new Date(apt.date).toDateString() === selectedDateObj.toDateString()
    );
  
    const conflictingApt = sameDayAppointments.reduce<Appointment | null>((earliest, apt) => {
      const aptStart = timeToMinutes(apt.startTime);
      if (aptStart > startTimeInMinutes) {
        if (!earliest || aptStart < timeToMinutes(earliest.startTime)) {
          return apt;
        }
      }
      return earliest;
    }, null);
  
    if (conflictingApt) {
      const conflictingStartMin = timeToMinutes(conflictingApt.startTime);
      maxEndTime = Math.min(maxEndTime, conflictingStartMin);
    }

    const durations = [30, 60, 90, 120, 150, 180, 210, 240];
    this.availableEndTimes = durations
      .map((d) => startTimeInMinutes + d)
      .filter((endM) => endM <= maxEndTime)
      .map((endM) => {
        const hh = String(Math.floor(endM / 60)).padStart(2, '0');
        const mm = String(endM % 60).padStart(2, '0');
        return `${hh}:${mm}`;
      });
  
    if (this.availableEndTimes.length > 0) {
      this.appointment.endTime = this.availableEndTimes[0];
    } else {
      this.appointment.endTime = '';
    }
  }
  

  save(): void {
    const date = this.resetTimeToMidnight(new Date(this.appointment.date));
    date.setDate(date.getDate() + 1);
  
    const appointmentToSave = {
      ...this.appointment,
      date: date.toISOString().split('T')[0], 
    };
    
    this.appointmentService.add(appointmentToSave).subscribe({
      next: (newAppointment) => {
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

  resetTimeToMidnight(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }
}
