import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Availability } from '../model/Availability';

@Injectable({
  providedIn: 'root'
})
export class AvailabilityService {
  private apiUrl = 'http://localhost:3000/availabilities';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Availability[]> {
    return this.http.get<Availability[]>(this.apiUrl);
  }

  get(id: string): Observable<Availability> {
    return this.http.get<Availability>(`${this.apiUrl}/${id}`);
  }

  add(availability: Availability): Observable<Availability> {
    return this.http.post<Availability>(this.apiUrl, availability);
  }
}
