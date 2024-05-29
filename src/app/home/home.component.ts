import { HeaderService } from '../services/headers.service';
import { UserDataService } from '../services/user-data.service';
import { MenuComponent } from './menu/menu.component';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [MenuComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export default class HomeComponent implements OnInit {

  constructor(private headerService: HeaderService,
    private userDataService: UserDataService) { }

  ngOnInit(): void {
    this.headerService.getToken();
    this.userDataService.uploadDataLocalStorage();
  }

}
