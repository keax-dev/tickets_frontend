import { Component, OnDestroy } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { MatButtonModule } from '@angular/material/button';
import { UserDataService } from '../../services/user-data.service';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';
import { AlertService } from '../../services/alert.service';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [MatMenuModule, MatButtonModule, MatIconModule, RouterModule],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css',
})
export class MenuComponent implements OnDestroy {

  menu_selected: number = 0;
  
  today: string = new Date().toISOString().substring(0, 10);

  logoutSubscription!: Subscription;

  constructor(    public userDataService: UserDataService,
    private alertService: AlertService,
    private authService: AuthService,
    private spinner: NgxSpinnerService,
    private router: Router  ) {
  }

  setMenuSelected(op: number): void {
    if (this.menu_selected == op) this.menu_selected = 0;
    else this.menu_selected = op;
  }

  ngOnDestroy(): void {
    this.logoutSubscription?.unsubscribe();
    this.spinner.hide();
  }

  logout() {
    this.spinner.show();
    this.logoutSubscription = this.authService.logout().subscribe({
      next: result => {
        if (result.status) {
          this.alertService.success(result.alert);
          this.authService.clearDataLocalStorage();
          this.router.navigateByUrl('/login');
        } else {
          this.alertService.error(result);
        }
        this.spinner.hide();
        this.logoutSubscription?.unsubscribe();
      },
      error: e => {
        this.alertService.success('Cierre de sesión correcto!');
        this.authService.clearDataLocalStorage();
        this.router.navigateByUrl('/login');
      }
    });
  }

}
