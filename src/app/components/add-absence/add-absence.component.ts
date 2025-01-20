import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { Absence } from '../../model/Absence';
import { AbsenceService } from '../../service/absence.service';

@Component({
  standalone: true,
  selector: 'app-add-absence',
  imports: [CommonModule, FormsModule, MatButtonModule, MatInputModule],
  templateUrl: './add-absence.component.html',
  styleUrls: ['./add-absence.component.css']
})
export class AddAbsenceComponent {
  absence: Absence = {
    startDate: new Date(),
    endDate: new Date()
  };

  constructor(
    private dialogRef: MatDialogRef<AddAbsenceComponent>,
    private absenceService: AbsenceService
  ) {}

  save(): void {
    this.absenceService.add(this.absence).subscribe({
      next: (newAbsence) => {
        this.dialogRef.close(newAbsence); // Close dialog and return new absence
      },
      error: (err) => {
        console.error('Failed to add absence:', err);
      },
    });
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
