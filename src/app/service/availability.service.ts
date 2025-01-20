import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Availability } from '../model/Availability';
import { Firestore, collection, getDocs, addDoc } from '@angular/fire/firestore';
import { from, map, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AvailabilityService {
  private apiUrl = 'http://localhost:3000/availabilities';
  private firestore = inject(Firestore);

  public mode: 'firebase' | 'jsonserver' | 'database' = 'jsonserver';

  constructor(private http: HttpClient) {}

  /**
   * Pobiera listę dostępności w postaci Observable<Availability[]>.
   */
  getAll(): Observable<Availability[]> {
    if (this.mode === 'firebase') {
      // getDocs(...) zwraca Promise; konwertujemy na Observable
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
      // HttpClient.get(...) zwraca Observable
      return this.http.get<Availability[]>(this.apiUrl);
    } else {
      // Tryb "database" lub inny – zwracamy pustą tablicę
      return of([]);
    }
  }

  /**
   * Dodaje nową dostępność i zwraca Observable<Availability>.
   */
  add(availability: Availability): Observable<Availability> {
    if (this.mode === 'firebase') {
      // addDoc(...) zwraca Promise; konwertujemy na Observable
      return from(addDoc(collection(this.firestore, 'availabilities'), availability)).pipe(
        map(docRef => {
          // Jeśli chcesz zwrócić nowo utworzoną Availability z ID wygenerowanym przez Firestore
          return { ...availability, id: docRef.id } as Availability;
        })
      );
    } else if (this.mode === 'jsonserver') {
      // POST przez HttpClient zwraca Observable
      return this.http.post<Availability>(this.apiUrl, availability);
    } else {
      // Pozostałe tryby – zwracamy pusty obiekt
      return of({} as Availability);
    }
  }
}
