import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Appointment } from '../model/Appointment';
import { from, map, Observable, of } from 'rxjs';

import { environment } from '../../environments/environment';
import {
  Firestore, collection, getDocs, addDoc, DocumentData,
  doc, updateDoc, deleteDoc
} from '@angular/fire/firestore';


@Injectable({
  providedIn: 'root',
})
export class AppointmentService {
  private apiUrl = 'http://localhost:3000/appointments';
  private firestore = inject(Firestore);

  private mode: 'firebase' | 'jsonserver' | 'database' =
    environment.databaseMode as 'firebase' | 'jsonserver' | 'database';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Appointment[]> {
    if (this.mode === 'firebase') {
      return from(getDocs(collection(this.firestore, 'appointments'))).pipe(
        map((snapshot) =>
          snapshot.docs.map((doc) => {
            const data = doc.data() as DocumentData;
            return {
              ...data,
              id: doc.id,
              date: typeof data['date'] === 'string' ? data['date'] : '',
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
      const appointmentToSave = {
        ...appointment,
        date: appointment.date,
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
      if (!appointment.id) {
        throw new Error('Appointment ID is required for update in Firebase.');
      }
      const appointmentRef = collection(this.firestore, 'appointments');
      const docRef = doc(appointmentRef, appointment.id);
      return from(updateDoc(docRef, { ...appointment }));
    } else if (this.mode === 'jsonserver') {
      if (!appointment.id) {
        throw new Error('Appointment ID is required for update in JSON Server.');
      }
      return this.http.put<void>(`${this.apiUrl}/${appointment.id}`, appointment);
    } else {
      return of();
    }
  }

  delete(appointment: Appointment): Observable<void> {
    if (this.mode === 'firebase') {
      if (!appointment.id) {
        throw new Error('Appointment ID is required for delete in Firebase.');
      }
      const appointmentRef = collection(this.firestore, 'appointments');
      const docRef = doc(appointmentRef, appointment.id);
      return from(deleteDoc(docRef)).pipe(
        map(() => {
          return;
        })
      );
    } else if (this.mode === 'jsonserver') {
      if (!appointment.id) {
        throw new Error('Appointment ID is required for delete in JSON Server.');
      }
      return this.http.delete<void>(`${this.apiUrl}/${appointment.id}`);
    } else {
      return of();
    }
  }
}
