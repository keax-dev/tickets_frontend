import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { CardModule } from 'primeng/card';
import { AuthStore } from '../../core/auth/auth.store';

@Component({
  standalone: true,
  imports: [CommonModule, CardModule],
  template: `
    <section class="page-card page">
      <div class="page-heading">
        <div>
          <h1>Perfil</h1>
          <p>Datos de la sesión actual y permisos efectivos.</p>
        </div>
      </div>

      @if (authStore.currentUser(); as currentUser) {
        <div class="grid">
          <p-card header="Nombre">{{ currentUser.firstName }} {{ currentUser.lastName }}</p-card>
          <p-card header="Correo">{{ currentUser.email }}</p-card>
          <p-card header="Rol">{{ currentUser.role }}</p-card>
        </div>
      }
    </section>
  `,
  styles: [
    `
      .page {
        padding: 1.5rem;
      }

      .grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 1rem;
      }
    `,
  ],
})
export class ProfilePageComponent {
  readonly authStore = inject(AuthStore);
}
