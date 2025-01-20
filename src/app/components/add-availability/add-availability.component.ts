import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { Availability } from '../../model/Availability';
import { AvailabilityService } from '../../service/availability.service';

@Component({
  standalone: true,
  selector: 'app-add-availability',
  imports: [
    CommonModule, 
    FormsModule, 
    MatButtonModule, 
    MatInputModule, 
    MatSelectModule,
    MatCardModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  templateUrl: './add-availability.component.html',
  styleUrls: ['./add-availability.component.css']
})
export class AddAvailabilityComponent {
  availability: Availability = {
    type: 'ONE_TIME',
    startDate: new Date(),
    startTime: '',
    endTime: '',
  };

  timeSlots: string[] = this.generateTimeSlots();
  daysOfWeekOptions = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  constructor(
    private dialogRef: MatDialogRef<AddAvailabilityComponent>,
    private availabilityService: AvailabilityService,
  ) {}

  save(): void {
    if (!this.isEndTimeValid()) {
      alert('End time must be later than start time!');
      return;
    }
  
    if (!this.isEndDateValid()) {
      alert('End date must be later than start date for recurring availability!');
      return;
    }
  
    this.availabilityService.add(this.availability).subscribe((newAvailability) => {
      this.dialogRef.close(newAvailability);
    });
  }

  cancel(): void {
    this.dialogRef.close();
  }

  // for start time & end time select
  private generateTimeSlots(): string[] {
    const slots: string[] = [];
    for (let hour = 0; hour < 24; hour++) {
      const hourString = hour.toString().padStart(2, '0');
      slots.push(`${hourString}:00`);
      slots.push(`${hourString}:30`);
    }

    return slots;
  }

  // ===================
  // Data validation
  private isEndTimeValid(): boolean {
    const startTimeParts = this.availability.startTime.split(':').map(Number);
    const endTimeParts = this.availability.endTime.split(':').map(Number);
  
    const startTimeInMinutes = startTimeParts[0] * 60 + startTimeParts[1];
    const endTimeInMinutes = endTimeParts[0] * 60 + endTimeParts[1];
  
    return endTimeInMinutes > startTimeInMinutes;
  }

  private isEndDateValid(): boolean {
    if (this.availability.type !== 'RECURRING') {
      return true;
    }
  
    if (!this.availability.startDate || !this.availability.endDate) {
      return false; 
    }
  
    const startDate = new Date(this.availability.startDate);
    const endDate = new Date(this.availability.endDate);
  
    return endDate > startDate;
  }
  // ===================
}
