import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/login/login').then((m) => m.LoginComponent),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./features/layout/layout').then((m) => m.LayoutComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'countries' },
      {
        path: 'countries',
        loadComponent: () =>
          import('./features/countries/countries').then((m) => m.CountriesComponent),
      },
      {
        path: 'cities',
        loadComponent: () => import('./features/cities/cities').then((m) => m.CitiesComponent),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
