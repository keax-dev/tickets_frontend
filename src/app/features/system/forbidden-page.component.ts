import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink, ButtonModule],
  template: `
    <section class="page-card system-page">
      <h1>Acceso denegado</h1>
      <p>No tienes permisos suficientes para entrar a esa sección.</p>
      <a pButton routerLink="/dashboard" label="Volver al dashboard"></a>
    </section>
  `,
  styles: [
    `
      .system-page {
        margin: 2rem auto;
        padding: 2rem;
        max-width: 560px;
        text-align: center;
      }
    `,
  ],
})
export class ForbiddenPageComponent {}
