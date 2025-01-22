import { Component, OnDestroy, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Appointment } from '../../model/Appointment';
import { Availability } from '../../model/Availability';
import { Absence } from '../../model/Absence';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AddAppointmentComponent } from '../add-appointment/add-appointment.component';
import { MatDialog } from '@angular/material/dialog';
import { AppointmentService } from '../../service/appointment.service';
import { ConfirmCancelDialogComponent } from '../cancel-appointment/cancel-appointment.component'; 


@Component({
  standalone: true,
  selector: 'app-calendar',
  imports: [
    CommonModule,
    MatTooltipModule
  ],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css'],
})
export class CalendarComponent implements OnInit, OnDestroy {
  timeSlots: string[] = [];
  selectedWeek: Date[] = [];
  currentDayIndex: number | null = null;
  currentSlotIndex: number | null = null; 
  redLinePosition: string | null = null; 
  private timeUpdater: any; 

  @Input() appointments: Appointment[] = []; 
  @Input() availabilities: Availability[] = [];
  @Input() absences: Absence[] = [];
  @Input() viewMode: 'doctor' | 'patient' = 'doctor';

  constructor(
    private dialog: MatDialog,
    private appointmentService: AppointmentService,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.timeSlots = this.generateTimeSlots();
    this.initializeWeek();
    this.updateCurrentTime();
    this.timeUpdater = setInterval(() => this.updateCurrentTime(), 60000);
    console.log("MODE", this.viewMode)
  }

  ngOnDestroy(): void {
    if (this.timeUpdater) {
      clearInterval(this.timeUpdater); 
    }
  }

  // Funkcja inicjalizująca przedziały czasowe co 30 minut
  private generateTimeSlots(): string[] {
    const slots: string[] = [];
    for (let hour = 0; hour < 24; hour++) {
      const hourString = hour.toString().padStart(2, '0');
      slots.push(`${hourString}:00`);
      slots.push(`${hourString}:30`);
    }

    return slots;
  }

  // Funkcja inicjalizująca obecny tydzień
  initializeWeek(): void {
    const today = new Date(); 
    const startOfWeek = this.getStartOfWeek(today);

    this.selectedWeek = Array.from({ length: 7 }, (_, index) => {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + index);
      return day;
    });

    this.updateCurrentDayIndex();
  }

  private updateCurrentDayIndex(): void {
    const today = new Date(); 
    this.currentDayIndex = this.selectedWeek.findIndex(
      (day) => day.toDateString() === today.toDateString()
    );
  }

  private getStartOfWeek(date: Date): Date {
    const dayOfWeek = date.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const start = new Date(date);
    start.setDate(date.getDate() + diff);
    start.setHours(0, 0, 0, 0);
    return start;
  }

  private updateCurrentTime(): void {
    const now = new Date();

    const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes() < 30 ? '00' : '30'}`;
    this.currentSlotIndex = this.timeSlots.findIndex((slot) => slot === timeString);

    const minutes = now.getMinutes();
    const positionInSlot = (minutes % 30) / 30; 
    this.redLinePosition = `${positionInSlot * 100}%`;
  }

  isAppointmentInSlot(appointment: Appointment, day: Date, slot: string): boolean {
    const appointmentDate = new Date(appointment.date); 
    const appointmentStart = appointment.startTime; 
    const appointmentEnd = appointment.endTime; 
    
    const isSameDay = appointmentDate.toDateString() === day.toDateString();
    
    const isInTimeRange = slot >= appointmentStart && slot < appointmentEnd;
  
    return isSameDay && isInTimeRange;
  }

  isPastAppointment(appointment: Appointment): boolean {
    const now = new Date();
    const appointmentDate = new Date(appointment.date);
    const [hours, minutes] = appointment.endTime.split(':').map(Number);
    appointmentDate.setHours(hours, minutes, 0, 0); 
  
    return appointmentDate < now; 
  }

  isAvailabilityInSlotForBackground(day: Date, slot: string): boolean {
    return this.availabilities.some(availability => {
      const startDate = new Date(availability.startDate);
      const endDate =
        availability.type === 'ONE_TIME'
          ? startDate 
          : availability.endDate
          ? new Date(availability.endDate)
          : null;
  
      const normalizeDate = (date: Date) => {
        const normalized = new Date(date);
        normalized.setHours(0, 0, 0, 0);
        return normalized;
      };
  
      const normalizedDay = normalizeDate(day);
      const normalizedStartDate = normalizeDate(startDate);
      const normalizedEndDate = endDate ? normalizeDate(endDate) : null;
  
      const isWithinDateRange = (!normalizedEndDate || normalizedDay <= normalizedEndDate) && normalizedDay >= normalizedStartDate;
  
      const dayOfWeek = day.toLocaleDateString('en-US', { weekday: 'long' }) as 
        | 'Monday'
        | 'Tuesday'
        | 'Wednesday'
        | 'Thursday'
        | 'Friday'
        | 'Saturday'
        | 'Sunday';
      const matchesRecurringDay =
        availability.type === 'RECURRING' &&
        availability.daysOfWeek?.includes(dayOfWeek);
  
      const [slotHours, slotMinutes] = slot.split(':').map(Number);
      const [startHours, startMinutes] = availability.startTime.split(':').map(Number);
      const [endHours, endMinutes] = availability.endTime.split(':').map(Number);
  
      const slotTime = slotHours * 60 + slotMinutes;
      const availabilityStartTime = startHours * 60 + startMinutes;
      const availabilityEndTime = endHours * 60 + endMinutes;
  
      const isWithinTimeRange =
        slotTime >= availabilityStartTime && slotTime < availabilityEndTime;
  
      return isWithinDateRange && (availability.type === 'ONE_TIME' || matchesRecurringDay) && isWithinTimeRange;
    });
  }

  isDayCoveredByAbsence(day: Date): boolean {
    return this.absences.some(absence => {
      const startDate = new Date(absence.startDate);
      const endDate = absence.endDate ? new Date(absence.endDate) : null;
  
      const normalizeDate = (date: Date) => {
        const normalized = new Date(date);
        normalized.setHours(0, 0, 0, 0);
        return normalized;
      };
  
      const normalizedDay = normalizeDate(day);
      const normalizedStartDate = normalizeDate(startDate);
      const normalizedEndDate = endDate ? normalizeDate(endDate) : null;
  
      return (
        normalizedDay >= normalizedStartDate &&
        (normalizedEndDate ? normalizedDay <= normalizedEndDate : true)
      );
    });
  }

  isAppointmentCoveredByAbsence(appointment: Appointment): boolean {
    const result = this.absences.some(absence => {
      const absenceStart = new Date(absence.startDate);
      const absenceEnd = absence.endDate ? new Date(absence.endDate) : absenceStart;
  
      const appointmentDate = new Date(appointment.date);
  
      const normalizeDate = (date: Date) => {
        const normalized = new Date(date);
        normalized.setHours(0, 0, 0, 0);
        return normalized;
      };
  
      const normalizedAbsenceStart = normalizeDate(absenceStart);
      const normalizedAbsenceEnd = normalizeDate(absenceEnd);
      const normalizedAppointmentDate = normalizeDate(appointmentDate);
  
      const isCovered =
        normalizedAppointmentDate >= normalizedAbsenceStart &&
        normalizedAppointmentDate <= normalizedAbsenceEnd;
  
      return isCovered;
    });

    return result;
  }
  
  getAppointmentsCount(day: Date): number {
    return this.appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.date);
      return appointmentDate.toDateString() === day.toDateString();
    }).length;
  }
  
  getAppointmentDetails(appointment: Appointment): string {
    return `
      First Name: ${appointment.firstName}
      Last Name: ${appointment.lastName}
      Age: ${appointment.age}
      Gender: ${appointment.gender}
      Consultation Type: ${appointment.type}
      Date: ${new Date(appointment.date).toLocaleDateString()}
      Time: ${appointment.startTime} - ${appointment.endTime}
      Notes: ${appointment.notes}
    `.trim();
  }  

  private changeWeek(direction: 'previous' | 'next'): void {
    const increment = direction === 'previous' ? -7 : 7;
    const startOfCurrentWeek = this.selectedWeek[0];
    const newStartDate = new Date(startOfCurrentWeek);
    newStartDate.setDate(startOfCurrentWeek.getDate() + increment);

    this.selectedWeek = Array.from({ length: 7 }, (_, index) => {
      const day = new Date(newStartDate);
      day.setDate(newStartDate.getDate() + index);
      return day;
    });
  }

  onPreviousClick(): void {
    this.changeWeek('previous');
    this.updateCurrentDayIndex();
  }

  onNextClick(): void {
    this.changeWeek('next');
    this.updateCurrentDayIndex();
  }

  onSlotClick(day: Date, slot: string): void {
    if (this.isDayCoveredByAbsence(day)) {
      return;
    }
  
    if (this.viewMode === 'patient' && this.isAvailabilityInSlotForBackground(day, slot) && !this.hasAppointment(day, slot)) {
      this.changeDetectorRef.detach();
      const dialogRef = this.dialog.open(AddAppointmentComponent, {
        width: '400px',
        data: {
          day,
          slot,
          availabilities: this.availabilities,
          appointments: this.appointments,
        },
      });
  
      dialogRef.afterClosed().subscribe((result) => {
        this.changeDetectorRef.reattach();
  
        if (result) {
          console.log('New appointment added:', result);
          this.loadAppointments();
        }
      });
    }
  }

  loadAppointments(): void {
    this.appointmentService.getAll().subscribe(data => {
      this.appointments = data;
    });
  }

  hasAppointment(day: Date, slot: string): boolean {
    return this.appointments.some((appointment) => this.isAppointmentInSlot(appointment, day, slot));
  }

  onAppointmentClick(appointment: Appointment, event: MouseEvent): void {
    event.stopPropagation();
  
    const dialogRef = this.dialog.open(ConfirmCancelDialogComponent, {
      width: '400px',
      data: {
        message: 'You are going to cancel an appointment. Are you sure?'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'yes') {
        this.appointmentService.delete(appointment).subscribe(() => {
          this.loadAppointments();
        });
      }
    });
  }
}

