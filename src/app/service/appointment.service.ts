import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Appointment } from '../model/Appointment';
import { Firestore, collection, getDocs, addDoc, Timestamp, DocumentData } from '@angular/fire/firestore';
// Uwaga: Timestamp można też spróbować importować z 'firebase/firestore'
import { from, map, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  private apiUrl = 'http://localhost:3000/appointments';
  private firestore = inject(Firestore);

  public mode: 'firebase' | 'jsonserver' | 'database' = 'jsonserver';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Appointment[]> {
    if (this.mode === 'firebase') {
      return from(getDocs(collection(this.firestore, 'appointments'))).pipe(
        map(snapshot => {
          return snapshot.docs.map(doc => {
            // doc.data() to typ DocumentData
            const data = doc.data() as DocumentData;

            let parsedDate: Date;
            if (data['date'] instanceof Timestamp) {
              // Firestore Timestamp → Date
              parsedDate = data['date'].toDate();
            } else {
              // Załóżmy, że to string (lub cokolwiek innego)
              parsedDate = new Date(data['date']);
            }

            // Składamy finalny obiekt:
            return {
              ...data,
              id: doc.id,
              date: parsedDate
            } as Appointment;
          });
        })
      );
    } else if (this.mode === 'jsonserver') {
      return this.http.get<Appointment[]>(this.apiUrl).pipe(
        map(appointments =>
          appointments.map(app => ({
            ...app,
            // JSON server najczęściej zwraca string daty:
            date: new Date(app.date)
          }))
        )
      );
    } else {
      return of([]);
    }
  }

  add(appointment: Appointment): Observable<Appointment> {
    if (this.mode === 'firebase') {
      // Zapisujemy, niech Firestore sam tworzy Timestamp
      return from(addDoc(collection(this.firestore, 'appointments'), appointment)).pipe(
        map(docRef => {
          // Zwracamy to samo + ID
          return { ...appointment, id: docRef.id } as Appointment;
        })
      );
    } else if (this.mode === 'jsonserver') {
      return this.http.post<Appointment>(this.apiUrl, appointment);
    } else {
      return of({} as Appointment);
    }
  }
}
