import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Appointment } from '../model/Appointment';
import { Firestore, collection, getDocs, addDoc, DocumentData, doc, updateDoc} from '@angular/fire/firestore';
import { from, map, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AppointmentService {
  private apiUrl = 'http://localhost:3000/appointments';
  private firestore = inject(Firestore);

  public mode: 'firebase' | 'jsonserver' | 'database' = 'jsonserver';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Appointment[]> {
    if (this.mode === 'firebase') {
      return from(getDocs(collection(this.firestore, 'appointments'))).pipe(
        map((snapshot) =>
          snapshot.docs.map((doc) => {
            const data = doc.data() as DocumentData;

            // Zakładamy, że data jest przechowywana jako string w Firestore
            return {
              ...data,
              id: doc.id,
              date: typeof data['date'] === 'string' ? data['date'] : '', // Upewniamy się, że data to string
            } as Appointment;
          })
        )
      );
    } else if (this.mode === 'jsonserver') {
      return this.http.get<Appointment[]>(this.apiUrl);
    } else {
      return of([]);
    }
  }

  add(appointment: Appointment): Observable<Appointment> {
    if (this.mode === 'firebase') {
      // Zapisujemy datę jako string
      const appointmentToSave = {
        ...appointment,
        date: appointment.date, // Data jest już stringiem
      };

      return from(addDoc(collection(this.firestore, 'appointments'), appointmentToSave)).pipe(
        map((docRef) => {
          return { ...appointmentToSave, id: docRef.id } as Appointment;
        })
      );
    } else if (this.mode === 'jsonserver') {
      return this.http.post<Appointment>(this.apiUrl, appointment);
    } else {
      return of({} as Appointment);
    }
  }

  update(appointment: Appointment): Observable<void> {
    if (this.mode === 'firebase') {
      // Firebase: aktualizujemy dokument na podstawie ID
      const appointmentRef = collection(this.firestore, 'appointments');
      if (!appointment.id) {
        throw new Error('Appointment ID is required for update in Firebase.');
      }
      const docRef = doc(appointmentRef, appointment.id);
      return from(updateDoc(docRef, { ...appointment }));
    } else if (this.mode === 'jsonserver') {
      // JSON Server: aktualizujemy rekord przez PATCH/PUT
      if (!appointment.id) {
        throw new Error('Appointment ID is required for update in JSON Server.');
      }
      return this.http.put<void>(`${this.apiUrl}/${appointment.id}`, appointment);
    } else {
      // W trybie "database" nic nie robimy
      return of();
    }
  }  
}