import { Directive, TemplateRef, ViewContainerRef, effect, inject, input } from '@angular/core';
import { AuthStore } from '../../core/auth/auth.store';
import { AppPermission } from '../models/api.models';

@Directive({
  selector: '[appHasPermission]',
})
export class HasPermissionDirective {
  readonly appHasPermission = input.required<AppPermission>();

  private readonly authStore = inject(AuthStore);
  private readonly templateRef = inject(TemplateRef<unknown>);
  private readonly viewContainerRef = inject(ViewContainerRef);

  constructor() {
    effect(() => {
      this.viewContainerRef.clear();
      if (this.authStore.hasPermission(this.appHasPermission())) {
        this.viewContainerRef.createEmbeddedView(this.templateRef);
      }
    });
  }
}
