import { Routes } from '@angular/router';

export const routes: Routes = [
    { path: 'login', title: 'Login', loadComponent: () => import('./auth/login/login.component') },
    {
        path: 'home', title: 'Home', loadComponent: () => import('./home/home.component'), children: [
            { path: 'entry-people', title: 'Ingreso de Personas', loadComponent: () => import('./home/request-submission/entry-people/entry-people.component') }
        ]
    },
    { path: '**', redirectTo: 'login', pathMatch: 'full' },
    { path: '', redirectTo: 'login', pathMatch: 'full' }
];
