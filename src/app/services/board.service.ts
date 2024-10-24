import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UpdateBoardRequestDTO } from '../models/update-board-request.dto';

@Injectable({
  providedIn: 'root',
})
export class BoardService {
  private apiUrl = 'http://localhost:8088/api/v1/board';

  constructor(private readonly http: HttpClient) {}

  createBoard(boardName: string): Observable<any> {
    const body = { name: boardName };
    const headers = new HttpHeaders({
      Authorization: `Bearer ${localStorage.getItem('jwtToken')}`,
    });
    return this.http.post(`${this.apiUrl}/save`, body, { headers });
  }

  getAllBoards(): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${localStorage.getItem('jwtToken')}`,
    });
    return this.http.get(`${this.apiUrl}/getAllBoards`, { headers });
  }

  deleteBoard(id: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${localStorage.getItem('jwtToken')}`,
    });
    return this.http.delete(`${this.apiUrl}/deleteById?id=${id}`, { headers });
  }

  updateBoard(updateBoardRequestDTO: UpdateBoardRequestDTO): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${localStorage.getItem('jwtToken')}`,
    });
    return this.http.put(`${this.apiUrl}/update`, updateBoardRequestDTO, {
      headers,
    });
  }
}
