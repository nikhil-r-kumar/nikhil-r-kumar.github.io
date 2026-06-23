import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/home/home').then(m => m.Home),
  },
  {
    path: 'pomodoro',
    loadComponent: () =>
      import('./pages/pomodoro/pomodoro').then(m => m.Pomodoro),
  },
  {
    path: 'grocery',
    loadComponent: () =>
      import('./pages/grocery/grocery').then(m => m.Grocery),
  },
  {
    path: 'portfolio',
    loadComponent: () =>
      import('./pages/portfolio/portfolio').then(m => m.Portfolio),
  },
];