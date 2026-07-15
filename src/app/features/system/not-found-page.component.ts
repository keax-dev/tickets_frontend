import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink, ButtonModule],
  template: `
    <section class="page-card system-page">
      <h1>Página no encontrada</h1>
      <p>La ruta solicitada no existe o ya no está disponible.</p>
      <a pButton routerLink="/dashboard" label="Ir al dashboard"></a>
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
export class NotFoundPageComponent {}
