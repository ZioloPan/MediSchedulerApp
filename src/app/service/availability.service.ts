import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Availability } from '../model/Availability';
import { Firestore, collection, getDocs, addDoc } from '@angular/fire/firestore';
import { from, map, Observable, of } from 'rxjs';
import { environment } from '../../environments/environment'; // <-- Import środowiska

@Injectable({
  providedIn: 'root'
})
export class AvailabilityService {
  private apiUrl = 'http://localhost:3000/availabilities';
  private firestore = inject(Firestore);

  private mode: 'firebase' | 'jsonserver' | 'database' =
    environment.databaseMode as 'firebase' | 'jsonserver' | 'database';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Availability[]> {
    if (this.mode === 'firebase') {
      return from(getDocs(collection(this.firestore, 'availabilities'))).pipe(
        map(snapshot => {
          const availability: Availability[] = [];
          snapshot.forEach(doc => {
            availability.push({ id: doc.id, ...doc.data() } as Availability);
          });
          return availability;
        })
      );
    } else if (this.mode === 'jsonserver') {
      return this.http.get<Availability[]>(this.apiUrl);
    } else {
      return of([]);
    }
  }

  add(availability: Availability): Observable<Availability> {
    if (this.mode === 'firebase') {
      return from(addDoc(collection(this.firestore, 'availabilities'), availability)).pipe(
        map(docRef => {
          return { ...availability, id: docRef.id } as Availability;
        })
      );
    } else if (this.mode === 'jsonserver') {
      return this.http.post<Availability>(this.apiUrl, availability);
    } else {
      return of({} as Availability);
    }
  }
}
