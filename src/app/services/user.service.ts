import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthenticationRequestDTO } from '../models/authentication-request.dto';  // Login için gerekli DTO
import { jwtDecode } from 'jwt-decode';  // JWT token decode etmek için
import { UserDTO } from '../models/user.dto';  // UserDTO modelimiz

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private apiUrl = 'http://localhost:8088/api/v1/authenticate'; // Backend'deki authenticate URL

  constructor(private http: HttpClient) {}

  authenticate(authRequest: AuthenticationRequestDTO): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}`, authRequest);
  }

  decodeToken(token: string): UserDTO {
    const decodedToken: any = jwtDecode(token); // Token'ı decode ediyoruz
    const user: UserDTO = {
      fullName: decodedToken.fullName,
      jobTitle: decodedToken.jobTitle,  // Sadece string olan jobTitle'ı alıyoruz
      sub: decodedToken.sub  // Email alanı (sub)
    };
    return user;
  }
  
}
