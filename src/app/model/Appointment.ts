export enum ConsultationType {
    FIRST_VISIT = 'FIRST_VISIT',
    FOLLOW_UP = 'FOLLOW_UP',
    CHRONIC_CONDITION = 'CHRONIC_CONDITION',
    PRESCRIPTION = 'PRESCRIPTION',
}

export interface Appointment {
    id?: string;
    date: Date;
    startTime: string;
    endTime: string;
    type: ConsultationType;
    notes: string;
    firstName: string; 
    lastName: string;  
    age: number;       
    gender: string;    
}
