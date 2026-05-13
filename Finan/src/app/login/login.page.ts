import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router'; // Importação necessária para o navigate
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
} from '@ionic/angular/standalone'; // Correção para o erro errr.PNG

import { AuthService } from '../services/auth';
import { addIcons } from 'ionicons';
import { mailOutline, lockClosedOutline } from 'ionicons/icons';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
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

  // Solução para err_2.PNG: Declarar o objeto 'usuario'
  usuario = {
    email: '',
    senha: ''
  };

  constructor() {
    // Registro de ícones para evitar o erro err.PNG
    addIcons({ mailOutline, lockClosedOutline });
  }

  async onLogin() {
    try {
      // Solução para errr_3.PNG: Passar os dois argumentos do objeto
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