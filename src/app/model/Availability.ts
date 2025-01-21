export interface Availability {
  id?: string;
  type: 'RECURRING' | 'ONE_TIME';
  startDate: string;
  endDate?: string; 
  daysOfWeek?: ('Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday')[]; 
  startTime: string; 
  endTime: string; 
}