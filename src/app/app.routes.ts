import { Routes } from '@angular/router';

export const routes: Routes = [
    { path: 'login', title: 'Login', loadComponent: () => import('./auth/login/login.component') },
    {
        path: 'home', loadComponent: () => import('./home/home.component'), children: [
            
        ]
    },
    { path: '**', redirectTo: 'login', pathMatch: 'full' },
    { path: '', redirectTo: 'login', pathMatch: 'full' }
];
