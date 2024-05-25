import { Injectable } from '@angular/core';
import { HeaderService } from './headers.service';
import { Observable } from 'rxjs'; 

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private headers: HeaderService) { }

  login(user: any): Observable<any> {
    return this.headers.http.post(`${this.headers.url}login`, user);
  }

}
