import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router'; // MODIFICADO: Adicionado Router e RouterLink
import { 
  IonContent, 
  IonHeader, 
  IonItem, 
  IonLabel, 
  IonIcon, 
  IonAvatar, 
  IonList 
} from '@ionic/angular/standalone';
import { ContasService } from '../services/contas.service';
import { addIcons } from 'ionicons';
import { 
  settings, 
  notificationsOutline, 
  lockClosedOutline, 
  chevronForwardOutline 
} from 'ionicons/icons';

@Component({
  selector: 'app-configuracao',
  templateUrl: './configuracao.page.html',
  styleUrls: ['./configuracao.page.scss'],   
  standalone: true,
  imports: [
    CommonModule, 
    RouterLink, // MODIFICADO: Importado para permitir o link no HTML
    IonContent, 
    IonHeader, 
    IonItem, 
    IonLabel, 
    IonIcon, 
    IonAvatar, 
    IonList
  ]
})
export class ConfiguracoesPage implements OnInit {
  nomeUsuario: string = '';
  fotoUsuario: string = localStorage.getItem('foto_usuario') || 'https://ionicframework.com/docs/img/demos/avatar.svg';

  // MODIFICADO: Injetado o Router do Angular para fazer o redirecionamento do logout
  constructor(
    private contasService: ContasService,
    private router: Router
  ) {
    addIcons({ 
      settings, 
      notificationsOutline, 
      lockClosedOutline, 
      chevronForwardOutline 
    });
  }

  ngOnInit() {
    this.nomeUsuario = this.contasService.buscarUsuario();
  }

  irParaNotificacoes() {
    console.log('Navegar para configurações de notificação');
  }

  irParaAlterarSenha() {
    console.log('Navegar para alteração de senha');
  }

  // MODIFICADO: Função limpa a sessão local e redireciona para a tela de login
  logout() {
    // 1. Remove a indicação de usuário logado (ajuste as chaves se o seu app usar nomes diferentes)
    localStorage.removeItem('usuario_logado'); 
    
    // Se o seu ContasService tiver uma função específica para deslogar (como limpar variáveis internas), você pode chamá-la aqui:
    // this.contasService.limparSessao();

    console.log('Usuário deslogado com sucesso.');

    // 2. Redireciona o usuário para a página de login de forma limpa
    this.router.navigate(['/login']);
  }
}