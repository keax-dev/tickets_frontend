import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-entry-people',
  standalone: true,
  imports: [MatDividerModule, CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatSelectModule],
  templateUrl: './entry-people.component.html',
  styleUrl: './entry-people.component.css'
})
export default class EntryPeopleComponent {

}
