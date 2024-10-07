import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RegistrationRequestDTO } from '../models/registration-request.dto';
import { AuthenticationRequestDTO } from '../models/authentication-request.dto';
import { PasswordResetRequestDTO } from '../models/password-reset-request.dto';
import { HttpParams } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';

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

  sendResetPasswordCode(email: string): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/forgot-password?email=${email}`,
      null
    );
  }

  resetPassword(
    token: string,
    request: PasswordResetRequestDTO
  ): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/reset-password?token=${token}`,
      request
    );
  }

  verifyResetCode(email: string, resetCode: string): Observable<any> {
    const params = new HttpParams().set('email', email).set('token', resetCode); // 'resetCode' yerine 'token' kullanıyoruz

    return this.http.post<any>(`${this.apiUrl}/forgot-password`, null, {
      params,
    });
  }

  resendActivationCode(token: string): Observable<any> {
    const params = new HttpParams().set('token', token); // Token parametresini HttpParams ile ekledik
    return this.http.post(`${this.apiUrl}/resend-activation-code`, null, {
      params,
    });
  }

  // Logout metodu
  logout(): Observable<any> {
    const token = localStorage.getItem('jwtToken');
    if (token) {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${token}`,
      });
      return this.http.post(`${this.apiUrl}/logout`, null, { headers });
    } else {
      console.error('JWT token not found!');
      return new Observable((observer) => {
        observer.error('JWT token not found');
      });
    }
  }
}
