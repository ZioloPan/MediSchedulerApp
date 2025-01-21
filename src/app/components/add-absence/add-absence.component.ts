import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { Absence } from '../../model/Absence';
import { AbsenceService } from '../../service/absence.service';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

@Component({
  standalone: true,
  selector: 'app-add-absence',
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatInputModule,
    MatCardModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  templateUrl: './add-absence.component.html',
  styleUrls: ['./add-absence.component.css'],
})
export class AddAbsenceComponent {
  absence: Absence = {
    startDate: '',
    endDate: '',
  };

  constructor(
    private dialogRef: MatDialogRef<AddAbsenceComponent>,
    private absenceService: AbsenceService
  ) {}

  save(): void {
    if (!this.isEndDateValid()) {
      alert('End date must be later than start date!');
      return;
    }
  
    const startDate = new Date(this.absence.startDate);
    startDate.setDate(startDate.getDate() + 1);
  
    const endDate = new Date(this.absence.endDate);
    endDate.setDate(endDate.getDate() + 1);
  
    const formattedAbsence: Absence = {
      ...this.absence,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
    };
  
    this.absenceService.add(formattedAbsence).subscribe({
      next: (newAbsence) => {
        console.log('Absence saved successfully:', newAbsence);
        this.dialogRef.close(newAbsence);
      },
      error: (err) => {
        console.error('Failed to add absence:', err);
      },
    });
  }

  cancel(): void {
    this.dialogRef.close();
  }

  private isEndDateValid(): boolean {
    if (!this.absence.startDate || !this.absence.endDate) {
      return false;
    }

    const startDate = new Date(this.absence.startDate);
    const endDate = new Date(this.absence.endDate);

    return endDate >= startDate;
  }
}
