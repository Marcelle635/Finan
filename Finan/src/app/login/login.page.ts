import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router'; 
import { 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
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
    IonHeader, 
    IonToolbar, 
    IonTitle, 
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

  // Mantenha o objeto usuario para evitar o erro err_3.PNG
  // No HTML use [(ngModel)]="usuario.email"
  usuario = {
    email: '',
    senha: ''
  };

  constructor() {
    addIcons({ mailOutline, lockClosedOutline, logoGoogle });
  }

  async loginComGoogle() {
    try {
      await this.exibirToast('Login social em desenvolvimento!', 'secondary');
    } catch (error) {
      this.exibirToast('Erro ao conectar com Google.', 'danger');
    }
  }

  // RENOMEADO PARA realizarLogin() para resolver o erro errr_5.PNG
  async realizarLogin() {
    if (!this.usuario.email || !this.usuario.senha) {
      await this.exibirToast('Por favor, preencha todos os campos.', 'warning');
      return;
    }

    try {
      // Passando os argumentos corretamente para resolver errr_3.PNG
      await this.authService.login(this.usuario.email, this.usuario.senha);
      
      await this.exibirToast('Bem-vindo!', 'success');
      this.router.navigate(['/home']);
    } catch (error: any) {
      this.tratarErro(error.code);
    }
  }

  private async tratarErro(codigo: string) {
    let mensagem = 'Erro ao realizar login.';
    if (codigo === 'auth/invalid-credential') mensagem = 'E-mail ou senha incorretos.';
    if (codigo === 'auth/invalid-email') mensagem = 'E-mail inválido.';
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