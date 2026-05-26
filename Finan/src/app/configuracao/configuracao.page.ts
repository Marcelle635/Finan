import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
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
  templateUrl: './configuracao.page.html', // CORRIGIDO PARA O SINGULAR!
  styleUrls: ['./configuracao.page.scss'],   // CORRIGIDO PARA O SINGULAR!
  standalone: true,
  imports: [
    CommonModule, 
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

  constructor(private contasService: ContasService) {
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

  logout() {
    console.log('Executar rotina de logout do app');
  }
}