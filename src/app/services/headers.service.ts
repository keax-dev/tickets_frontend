import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GLOBAL } from './GLOBAL';

@Injectable({
  providedIn: 'root'
})
export class HeaderService {

  httpOptions: any;
  url = GLOBAL.url;

  constructor(public http: HttpClient) {
    this.getToken();
  }

  getToken() {
    this.httpOptions = { headers: new HttpHeaders({ 'Accept': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` }) };
  }

}
