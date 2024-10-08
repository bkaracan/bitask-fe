import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class JobTitleService {
  private readonly apiUrl =
    'http://localhost:8088/api/v1/search/getAllJobTitles';

  constructor(private readonly http: HttpClient) {}

  getJobTitles(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }
}
