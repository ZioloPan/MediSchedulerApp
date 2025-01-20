import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Availability } from '../../model/Availability';
import { AvailabilityService } from '../../service/availability.service';

@Component({
  standalone: true,
  selector: 'app-add-availability',
  imports: [CommonModule, FormsModule, MatButtonModule, MatInputModule, MatSelectModule],
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

  daysOfWeekOptions = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  constructor(
    private dialogRef: MatDialogRef<AddAvailabilityComponent>,
    private availabilityService: AvailabilityService,
  ) {}

  save(): void {
    this.availabilityService.add(this.availability).subscribe({
      next: (newAvailability) => {
        this.dialogRef.close(newAvailability); 
      },
    });
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
