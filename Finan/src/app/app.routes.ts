import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'cadastro',
    loadComponent: () => import('./cadastro/cadastro.page').then(m => m.CadastroPage)
  },
  {
    path: 'login',
    loadComponent: () => import('./login/login.page').then(m => m.LoginPage)
  },
  {
    path: 'casa',
    loadComponent: () => import('./casa/casa.page').then(m => m.CasaPage)
  },
  {
    path: '',
    redirectTo: 'cadastro', // Define que ao abrir o app, vai para o cadastro
    pathMatch: 'full'
  },
  {
    path: 'home',
    redirectTo: 'casa', // Redireciona caso algum código antigo ainda tente ir para /home
    pathMatch: 'full'
  }
];