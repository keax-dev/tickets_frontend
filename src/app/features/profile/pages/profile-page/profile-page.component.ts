import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { getAppRoleLabel } from '../../../../shared/constants/ui.constants';
import { AppRole } from '../../../../shared/models/api.models';
import { AuthStore } from '../../../../core/auth/stores/auth.store';

@Component({
  standalone: true,
  imports: [CommonModule, CardModule],
  templateUrl: './profile-page.component.html',
  styleUrl: './profile-page.component.css',
})
export class ProfilePageComponent {
  readonly authStore = inject(AuthStore);

  roleLabel(role: AppRole): string {
    return getAppRoleLabel(role);
  }
}
