import { LocalStorageService } from './local-storage.service';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UserDataService {

  private accountingDate!: string;
  private currentDate!: string;
  private terminal!: string;
  private rolName!: string;
  private branch!: string;
  private office!: string;
  private area!: string;
  private user!: string;
  private rol!: number;

  constructor(private localStorageService: LocalStorageService) {
    this.uploadDataLocalStorage();
  }

  uploadDataLocalStorage() {
    try {
      this.accountingDate = this.localStorageService.decrypt(String(localStorage.getItem('ad')));
    } catch (error) {
      this.accountingDate = '';
    }
    try {
      this.currentDate = this.localStorageService.decrypt(String(localStorage.getItem('cd')));
    } catch (error) {
      this.currentDate = '';
    }
    try {
      this.terminal = this.localStorageService.decrypt(String(localStorage.getItem('t')));
    } catch (error) {
      this.terminal = '';
    }
    try {
      this.branch = this.localStorageService.decrypt(String(localStorage.getItem('b')));
    } catch (error) {
      this.branch = '';
    }
    try {
      this.office = this.localStorageService.decrypt(String(localStorage.getItem('o')));
    } catch (error) {
      this.office = '';
    }
    try {
      this.area = this.localStorageService.decrypt(String(localStorage.getItem('a')));
    } catch (error) {
      this.area = '';
    }
    try {
      this.user = this.localStorageService.decrypt(String(localStorage.getItem('u')));
    } catch (error) {
      this.user = '';
    }
    try {
      this.rol = Number(this.localStorageService.decrypt(String(localStorage.getItem('r'))));
    } catch (error) {
      this.rol = 0;
    }
    try {
      this.rolName = this.localStorageService.decrypt(String(localStorage.getItem('rn')));
    } catch (error) {
      this.rolName = '';
    }
  }

  saveAccountingDate(accountingDate: string) {
    localStorage.setItem('ad', this.localStorageService.encrypt(accountingDate));
  }

  saveDurrentDate(currentDate: string) {
    localStorage.setItem('cd', this.localStorageService.encrypt(currentDate));
  }

  saveTerminal(terminal: string) {
    localStorage.setItem('t', this.localStorageService.encrypt(terminal));
  }

  saveBranch(branch: string) {
    localStorage.setItem('b', this.localStorageService.encrypt(branch));
  }

  saveOffice(office: string) {
    localStorage.setItem('o', this.localStorageService.encrypt(office));
  }

  saveArea(area: string) {
    localStorage.setItem('a', this.localStorageService.encrypt(area));
  }

  saveUser(user: string) {
    localStorage.setItem('u', this.localStorageService.encrypt(user));
  }

  saveRol(rol: string) {
    localStorage.setItem('r', this.localStorageService.encrypt(rol));
  }

  saveRolName(rol: string) {
    localStorage.setItem('rn', this.localStorageService.encrypt(rol));
  }

  getAccountingDate() {
    return this.accountingDate;
  }

  getCurrentDate() {
    return this.currentDate;
  }

  getTerminal() {
    return this.terminal;
  }

  getBranch() {
    return this.branch;
  }

  getOffice() {
    return this.office;
  }

  getArea() {
    return this.area;
  }

  getUser() {
    return this.user;
  }

  getRol() {
    return this.rol;
  }

  getRolName() {
    return this.rolName;
  }

}
