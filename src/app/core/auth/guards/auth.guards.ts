import { AppPermission } from '../../../shared/models/api.models';
import { AuthStore } from '../stores/auth.store';
import { inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  CanActivateFn,
  Router,
} from '@angular/router';

export const authGuard: CanActivateFn = (
  _route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
) => {
  const authStore = inject(AuthStore);
  const router = inject(Router);

  if (authStore.isAuthenticated()) {
    return true;
  }

  authStore.rememberRequestedUrl(state.url);
  return router.createUrlTree(['/login']);
};

export const guestGuard: CanActivateFn = () => {
  const authStore = inject(AuthStore);
  const router = inject(Router);

  return authStore.isAuthenticated() ? router.createUrlTree(['/dashboard']) : true;
};

export const permissionGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const requiredPermission = route.data['permission'] as AppPermission | undefined;
  const authStore = inject(AuthStore);
  const router = inject(Router);

  if (!requiredPermission || authStore.hasPermission(requiredPermission)) {
    return true;
  }

  return router.createUrlTree(['/forbidden']);
};
