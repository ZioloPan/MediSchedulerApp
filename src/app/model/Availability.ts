export interface Availability {
    id: string; // Identyfikator dostępności
    type: 'RECURRING' | 'ONE_TIME'; // Typ dostępności: cykliczna lub jednorazowa
    startDate: Date; // Data rozpoczęcia (dotyczy cyklicznej)
    endDate?: Date; // Data zakończenia (opcjonalna, dotyczy cyklicznej)
    daysOfWeek?: string[]; // Maski dni tygodnia dla cyklicznej np. ['Monday', 'Wednesday']
    timeSlots: TimeSlot[]; // Przedziały czasowe konsultacji
    specificDate?: Date; // Jednorazowa dostępność: konkretna data (tylko dla typu ONE_TIME)
  }
  
  export interface TimeSlot {
    startTime: string; // Godzina rozpoczęcia w formacie HH:mm
    endTime: string; // Godzina zakończenia w formacie HH:mm
  }