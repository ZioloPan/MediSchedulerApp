import { Component, OnDestroy, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Appointment } from '../../model/Appointment';
import { Availability } from '../../model/Availability';
import { Absence } from '../../model/Absence';
import { ConsultationType } from '../../model/Appointment';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AddAppointmentComponent } from '../add-appointment/add-appointment.component';
import { MatDialog } from '@angular/material/dialog';
import { AppointmentService } from '../../service/appointment.service';

const CONSULTATION_TYPE_LABELS: { [key in ConsultationType]: string } = {
  [ConsultationType.FIRST_VISIT]: 'First Visit',
  [ConsultationType.FOLLOW_UP]: 'Follow-Up Visit',
  [ConsultationType.CHRONIC_CONDITION]: 'Chronic Condition',
  [ConsultationType.PRESCRIPTION]: 'Prescription',
};

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
  currentSlotIndex: number | null = null; // Indeks aktualnego slotu do zaznaczenia linią
  redLinePosition: string | null = null; // Pozycja czerwonej linii w procentach
  private timeUpdater: any; // Referencja do `setInterval`

  @Input() appointments: Appointment[] = []; // Właściwość do odbierania wizyt
  @Input() availabilities: Availability[] = [];
  @Input() absences: Absence[] = [];
  @Input() viewMode: 'doctor' | 'patient' = 'doctor'; // Domyślny tryb

  constructor(
    private dialog: MatDialog,
    private appointmentService: AppointmentService,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.timeSlots = this.generateTimeSlots();
    this.initializeWeek();
    this.updateCurrentTime(); // Ustaw aktualny czas
    this.timeUpdater = setInterval(() => this.updateCurrentTime(), 60000); // Aktualizacja co minutę

    console.log("MODE", this.viewMode)
  }

  ngOnDestroy(): void {
    if (this.timeUpdater) {
      clearInterval(this.timeUpdater); // Usuń interwał po zniszczeniu komponentu
    }
  }

  getConsultationTypeLabel(type: ConsultationType): string {
    return CONSULTATION_TYPE_LABELS[type];
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

    // Zaktualizuj `currentDayIndex`
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

    // Oblicz aktualny slot czasowy
    const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes() < 30 ? '00' : '30'}`;
    this.currentSlotIndex = this.timeSlots.findIndex((slot) => slot === timeString);

    // Oblicz pozycję linii w bieżącym slocie czasowym
    const minutes = now.getMinutes();
    const positionInSlot = (minutes % 30) / 30; // Wartość w zakresie 0-1
    this.redLinePosition = `${positionInSlot * 100}%`;
  }

  isAppointmentInSlot(appointment: Appointment, day: Date, slot: string): boolean {
    const appointmentDate = new Date(appointment.date); // Konwersja daty wizyty
    const appointmentStart = appointment.startTime; // Początek wizyty (HH:mm)
    const appointmentEnd = appointment.endTime; // Koniec wizyty (HH:mm)
    
    // Sprawdzenie, czy data wizyty pasuje do dnia z kalendarza
    const isSameDay = appointmentDate.toDateString() === day.toDateString();
    
    // Sprawdzenie, czy slot mieści się w zakresie czasu wizyty
    const isInTimeRange = slot >= appointmentStart && slot < appointmentEnd;
  
    return isSameDay && isInTimeRange;
  }

  isPastAppointment(appointment: Appointment): boolean {
    const now = new Date();
    const appointmentDate = new Date(appointment.date);
    const [hours, minutes] = appointment.endTime.split(':').map(Number);
    appointmentDate.setHours(hours, minutes, 0, 0); // Ustaw koniec wizyty jako dokładny czas
  
    return appointmentDate < now; // Zwróć true, jeśli wizyta się zakończyła
  }

  isAvailabilityInSlotForBackground(day: Date, slot: string): boolean {
    return this.availabilities.some(availability => {
      // Ustawienie endDate na startDate w przypadku typu ONE_TIME
      const startDate = new Date(availability.startDate);
      const endDate =
        availability.type === 'ONE_TIME'
          ? startDate // ONE_TIME: startDate to także endDate
          : availability.endDate
          ? new Date(availability.endDate)
          : null;
  
      // Normalizacja dat do północy
      const normalizeDate = (date: Date) => {
        const normalized = new Date(date);
        normalized.setHours(0, 0, 0, 0);
        return normalized;
      };
  
      const normalizedDay = normalizeDate(day);
      const normalizedStartDate = normalizeDate(startDate);
      const normalizedEndDate = endDate ? normalizeDate(endDate) : null;
  
      // Sprawdzenie, czy dzień mieści się w zakresie dat
      const isWithinDateRange = (!normalizedEndDate || normalizedDay <= normalizedEndDate) && normalizedDay >= normalizedStartDate;
  
      // Sprawdzenie, czy dzień tygodnia pasuje do dostępności cyklicznej
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
  
      // Sprawdzenie, czy slot czasowy mieści się w przedziale dostępności
      const [slotHours, slotMinutes] = slot.split(':').map(Number);
      const [startHours, startMinutes] = availability.startTime.split(':').map(Number);
      const [endHours, endMinutes] = availability.endTime.split(':').map(Number);
  
      const slotTime = slotHours * 60 + slotMinutes;
      const availabilityStartTime = startHours * 60 + startMinutes;
      const availabilityEndTime = endHours * 60 + endMinutes;
  
      const isWithinTimeRange =
        slotTime >= availabilityStartTime && slotTime < availabilityEndTime;
  
      // Wynik końcowy
      return isWithinDateRange && (availability.type === 'ONE_TIME' || matchesRecurringDay) && isWithinTimeRange;
    });
  }

  isDayCoveredByAbsence(day: Date): boolean {
    return this.absences.some(absence => {
      // Konwersja daty na obiekt typu Date
      const startDate = new Date(absence.startDate);
      const endDate = absence.endDate ? new Date(absence.endDate) : null;
  
      // Normalizacja dat
      const normalizeDate = (date: Date) => {
        const normalized = new Date(date);
        normalized.setHours(0, 0, 0, 0);
        return normalized;
      };
  
      const normalizedDay = normalizeDate(day);
      const normalizedStartDate = normalizeDate(startDate);
      const normalizedEndDate = endDate ? normalizeDate(endDate) : null;
  
      // Sprawdzanie, czy dzień mieści się w zakresie absencji
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
      Consultation Type: ${this.getConsultationTypeLabel(appointment.type)}
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

    // Generuj nowy tydzień
    this.selectedWeek = Array.from({ length: 7 }, (_, index) => {
      const day = new Date(newStartDate);
      day.setDate(newStartDate.getDate() + index);
      return day;
    });
  }

  // Obsługa przycisku "Poprzedni tydzień"
  onPreviousClick(): void {
    this.changeWeek('previous');
    this.updateCurrentDayIndex();
  }

  // Obsługa przycisku "Następny tydzień"
  onNextClick(): void {
    this.changeWeek('next');
    this.updateCurrentDayIndex();
  }

  // Funkcja wywoływana przy kliknięciu na slot
  onSlotClick(day: Date, slot: string): void {
    if (this.viewMode === 'patient' && this.isAvailabilityInSlotForBackground(day, slot) && !this.hasAppointment(day, slot)) {
      // Otwórz dialog AddAppointment
      this.changeDetectorRef.detach();
      const dialogRef = this.dialog.open(AddAppointmentComponent, {
        width: '400px',
        data: {
          day,
          slot,
          availabilities: this.availabilities,
          appointments: this.appointments
        }
      });

      // Przetwarzanie wyniku zamknięcia dialogu (np. odświeżenie widoku)
      dialogRef.afterClosed().subscribe((result) => {
        this.changeDetectorRef.reattach();

        if (result) {
          console.log('New appointment added:', result);
          this.loadAppointments()
        }
      });
    }
  }

  loadAppointments(): void {
    // Reload appointments, e.g., by emitting an event or fetching them from the service
    this.appointmentService.getAll().subscribe(data => {
      this.appointments = data;
    });
  }

  // Sprawdzanie, czy w danym slocie istnieje już wizyta
  hasAppointment(day: Date, slot: string): boolean {
    return this.appointments.some((appointment) => this.isAppointmentInSlot(appointment, day, slot));
  }
}

