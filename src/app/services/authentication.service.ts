import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RegistrationRequestDTO } from '../models/registration-request.dto';
import { AuthenticationRequestDTO } from '../models/authentication-request.dto';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  private apiUrl = 'http://localhost:8088/api/v1/auth'; // Backend URL'i

  constructor(private http: HttpClient) {}

  register(registrationData: RegistrationRequestDTO): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, registrationData);
  }

  authenticate(authData: AuthenticationRequestDTO): Observable<any> {
    return this.http.post(`${this.apiUrl}/authenticate`, authData);
  }

  activateAccount(token: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/activate-account?token=${token}`);
    
    }
  }