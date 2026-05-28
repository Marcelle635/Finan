import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router'; 
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
    RouterLink, 
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
    this.router.navigate(['/notificacoes']);
  }

  irParaAlterarSenha() {
    // MODIFICADO: Descomentado e configurado para navegar para a tela de alterar-senha
    this.router.navigate(['/alterar-senha']);
  }

  logout() {
    localStorage.removeItem('usuario_logado'); 
    console.log('Usuário deslogado com sucesso.');
    this.router.navigate(['/login']);
  }
}