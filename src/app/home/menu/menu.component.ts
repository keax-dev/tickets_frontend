import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { Component } from '@angular/core';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [MatMenuModule, MatButtonModule, MatIconModule],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css',
})
export class MenuComponent {
  menu_selected: number = 0;

  setMenuSelected(op: number): void {
    if (this.menu_selected == op) this.menu_selected = 0;
    else this.menu_selected = op;
  }
}
