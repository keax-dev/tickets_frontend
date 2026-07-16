import { Directive, TemplateRef, ViewContainerRef, effect, inject, input } from '@angular/core';
import { AppPermission } from '../models/api.models';
import { AuthStore } from '../../core/auth/stores/auth.store';

@Directive({
  selector: '[appHasPermission]',
})
export class HasPermissionDirective {
  readonly appHasPermission = input.required<AppPermission>();

  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly templateRef = inject(TemplateRef<unknown>);
  private readonly authStore = inject(AuthStore);

  constructor() {
    effect(() => {
      this.viewContainerRef.clear();
      if (this.authStore.hasPermission(this.appHasPermission())) {
        this.viewContainerRef.createEmbeddedView(this.templateRef);
      }
    });
  }
}
