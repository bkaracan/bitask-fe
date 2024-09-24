import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class UserStatusService {
  private apiUrl = 'http://localhost:8088/api/v1/search/getAllUserStatus';

  constructor(private http: HttpClient) {}

  getAllUserStatus(): Observable<any> {
    const token = localStorage.getItem('jwtToken');  // Token'ı localStorage'dan alıyoruz
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`  // Token'ı header'a ekliyoruz
    });

    return this.http.get<any>(this.apiUrl, { headers });
  }
}