import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home', // Alterado de 'inicio' para 'home'
    pathMatch: 'full',
  },
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then( m => m.HomePage)
  },
  {
    path: 'login',
    loadComponent: () => import('./login/login.page').then( m => m.LoginPage)
  },
  {
    path: 'cadastro',
    loadComponent: () => import('./cadastro/cadastro.page').then( m => m.CadastroPage)
  },
  {
    path: 'casa',
    loadComponent: () => import('./casa/casa.page').then( m => m.CasaPage)
  },
  {
    path: 'entradas',
    loadComponent: () => import('./entradas/entradas.page').then( m => m.EntradasPage)
  },
  {
    path: 'grafico',
    loadComponent: () => import('./grafico/grafico.page').then( m => m.GraficoPage)
  },
  {
    path: 'desejos',
    loadComponent: () => import('./desejos/desejos.page').then( m => m.DesejosPage)
  },
];