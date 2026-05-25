import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router'; 
import { 
  IonContent, 
  IonItem, 
  IonLabel, 
  IonInput, 
  IonButton, 
  IonIcon,
  ToastController 
} from '@ionic/angular/standalone'; 

import { AuthService } from '../services/auth';
import { addIcons } from 'ionicons';
import { mailOutline, lockClosedOutline, logoGoogle } from 'ionicons/icons';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'], 
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    IonContent, 
    IonItem, 
    IonLabel, 
    IonInput, 
    IonButton, 
    IonIcon
  ]
})
export class LoginPage {
  private authService = inject(AuthService);
  private router = inject(Router);
  private toastCtrl = inject(ToastController);

  usuario = {
    email: '',
    senha: ''
  };

  constructor() {
    addIcons({ mailOutline, lockClosedOutline, logoGoogle });
  }

  async realizarLogin() {
    if (!this.usuario.email || !this.usuario.senha) {
      await this.exibirToast('Por favor, preencha todos os campos.', 'warning');
      return;
    }

    try {
      await this.authService.login(this.usuario.email, this.usuario.senha);
      
      await this.exibirToast('Bem-vindo!', 'success');
      
      // REDIRECIONA PARA /CASA (conforme seu novo componente)
      this.router.navigate(['/casa']);
    } catch (error: any) {
      this.tratarErro(error.code);
    }
  }

 
async loginComGoogle() {
  try {
    
    await this.authService.loginComGoogle();
    
    await this.exibirToast('Bem-vindo com o Google!', 'success');
    
    // Redireciona para a tela principal do Finan
    this.router.navigate(['/casa']);
  } catch (error: any) {
    console.error(error);
    
    // Evita erro "feio" caso o usuário mude de ideia e feche a janela do Google
    if (error.code === 'auth/popup-closed-by-user') {
      await this.exibirToast('Login cancelado.', 'warning');
    } else {
      await this.exibirToast('Erro ao logar com o Google.', 'danger');
    }
  }
}

  private async tratarErro(codigo: string) {
    let mensagem = 'Erro ao realizar login.';
    if (codigo === 'auth/invalid-credential') mensagem = 'E-mail ou senha incorretos.';
    if (codigo === 'auth/user-not-found') mensagem = 'Usuário não encontrado.';
    await this.exibirToast(mensagem, 'danger');
  }

  private async exibirToast(mensagem: string, cor: string) {
    const toast = await this.toastCtrl.create({
      message: mensagem,
      duration: 2000,
      color: cor
    });
    await toast.present();
  }
}