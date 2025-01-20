import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Absence } from '../model/Absence';
import { Firestore, collection, addDoc, getDocs } from '@angular/fire/firestore';
import { from, map, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AbsenceService {
  private apiUrl = 'http://localhost:3000/absences';
  private firestore = inject(Firestore);

  public mode: 'firebase' | 'jsonserver' | 'database' = 'jsonserver';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Absence[]> {
    if (this.mode === 'firebase') {
      // getDocs(...) zwraca Promise, więc konwertujemy go na Observable:
      return from(getDocs(collection(this.firestore, 'absences'))).pipe(
        map(snapshot => {
          const absences: Absence[] = [];
          snapshot.forEach(doc => {
            absences.push({ id: doc.id, ...doc.data() } as Absence);
          });
          console.log(absences);
          return absences;
        })
      );
    } else if (this.mode === 'jsonserver') {
      // HttpClient.get(...) już zwraca Observable
      return this.http.get<Absence[]>(this.apiUrl);
    } else {
      // tryb "database" - nic nie robimy
      return of([]);
    }
  }

  add(absence: Absence): Observable<Absence> {
    if (this.mode === 'firebase') {
      // addDoc(...) zwraca Promise, konwertujemy na Observable:
      return from(addDoc(collection(this.firestore, 'absences'), absence)).pipe(
        map(docRef => {
          // Jeżeli chcesz zwracać od razu utworzony obiekt z ID wygenerowanym przez Firestore
          return { ...absence, id: docRef.id } as Absence;
        })
      );
    } else if (this.mode === 'jsonserver') {
      // POST zwraca Observable
      return this.http.post<Absence>(this.apiUrl, absence);
    } else {
      return of({} as Absence);
    }
  }
}
