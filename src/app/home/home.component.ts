import { Component, OnInit } from '@angular/core';
import { UserDataService } from '../services/user-data.service';
import { HeaderService } from '../services/headers.service';
import { MenuComponent } from './menu/menu.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [MenuComponent,RouterModule],
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
