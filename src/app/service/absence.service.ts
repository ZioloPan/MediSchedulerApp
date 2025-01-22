import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Absence } from '../model/Absence';
import { Firestore, collection, addDoc, getDocs } from '@angular/fire/firestore';
import { from, map, Observable, of } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AbsenceService {
  private apiUrl = 'http://localhost:3000/absences';
  private firestore = inject(Firestore);

  private mode: 'firebase' | 'jsonserver' | 'database' =
    environment.databaseMode as 'firebase' | 'jsonserver' | 'database';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Absence[]> {
    if (this.mode === 'firebase') {
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
      return this.http.get<Absence[]>(this.apiUrl);
    } else {
      return of([]);
    }
  }

  add(absence: Absence): Observable<Absence> {
    if (this.mode === 'firebase') {
      return from(addDoc(collection(this.firestore, 'absences'), absence)).pipe(
        map(docRef => {
          return { ...absence, id: docRef.id } as Absence;
        })
      );
    } else if (this.mode === 'jsonserver') {
      return this.http.post<Absence>(this.apiUrl, absence);
    } else {
      return of({} as Absence);
    }
  }
}
