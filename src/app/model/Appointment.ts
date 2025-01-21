export interface Appointment {
    id?: string;
    date: string;
    startTime: string;
    endTime: string;
    type: 'First Visit' | 'Follow-Up Visit' | 'Chronic Condition' | 'Prescription';
    notes: string;
    firstName: string; 
    lastName: string;  
    age: number;       
    gender: string; 
    isPayed: boolean;   
}
