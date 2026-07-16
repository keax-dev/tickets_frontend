import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { RouterLink } from '@angular/router';
import { Component } from '@angular/core';

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink, ButtonModule],
  templateUrl: './forbidden-page.component.html',
  styleUrl: './forbidden-page.component.css',
})
export class ForbiddenPageComponent {}
