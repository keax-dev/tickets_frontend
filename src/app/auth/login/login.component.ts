import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { NgxSpinnerService } from 'ngx-spinner';
import { MatButtonModule } from '@angular/material/button';
import { UserDataService } from '../../services/user-data.service';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { AlertService } from '../../services/alert.service';
import { AuthService } from '../../services/auth.service';
import { Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export default class LoginComponent implements OnDestroy {

  loginForm: FormGroup = this.fb.group({
    cpersona: ['', [Validators.required]],
    password: ['', Validators.required]
  });

  hide: boolean = true;

  loginSubscription!: Subscription;

  constructor(private authService: AuthService,
    private userDataService: UserDataService,
    private alertService: AlertService,
    private spinner: NgxSpinnerService,
    private router: Router,
    private fb: FormBuilder) { }

  ngOnDestroy(): void {
    this.loginSubscription?.unsubscribe();
    this.spinner.hide();
  }

  login() {
    if (this.loginForm.valid) {
      this.spinner.show();
      this.loginSubscription = this.authService.login(this.loginForm.value).subscribe({
        next: result => {
          if (result.status) {
            this.alertService.success(result.alert);
            this.saveInformationUser(result.data.user);
            localStorage.setItem('token', result.data.token);
          } else {
            this.alertService.error(result);
          }
          this.spinner.hide();
          this.loginSubscription?.unsubscribe();
        },
        error: e => this.alertService.errorApplication(this.spinner)
      });
    }
  }

  saveInformationUser(user: any) {
    // this.userDataService.saveAccountingDate();
    // this.userDataService.saveDurrentDate(user.);
    this.userDataService.saveTerminal(user.terminal);
    this.userDataService.saveBranch(user.sucursal);
    this.userDataService.saveOffice(user.oficina);
    this.userDataService.saveArea(user.area);
    this.userDataService.saveUser(user.cpersona);
    this.userDataService.saveRol(Number(user.role.id).toString());
    this.userDataService.saveRolName(user.role.name);
    this.router.navigateByUrl('/home');
  }

}
