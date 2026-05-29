import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router'; 
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
    RouterLink,
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

  passoLogin: 'login' | 'verificarEmail' = 'login';

  usuario = {
    email: '',
    senha: ''
  };

  emailRecuperacao: string = '';

  constructor() {
    addIcons({ mailOutline, lockClosedOutline, logoGoogle });
  }

  async realizarLogin() {
    if (!this.usuario.email || !this.usuario.senha) {
      await this.exibirToast('Por favor, preencha todos os campos.', 'warning');
      return;
    }

    try {
      const credencial = await this.authService.login(this.usuario.email, this.usuario.senha);
      
      const usuariosCadastrados = JSON.parse(localStorage.getItem('app_usuarios_cadastrados') || '[]');
      const usuarioEncontrado = usuariosCadastrados.find((u: any) => u.email.toLowerCase() === this.usuario.email.toLowerCase());

      if (usuarioEncontrado && usuarioEncontrado.nome) {
        localStorage.setItem('usuario_logado', usuarioEncontrado.nome);
      } else if (credencial?.user?.displayName) {
        localStorage.setItem('usuario_logado', credencial.user.displayName);
      } else {
        localStorage.setItem('usuario_logado', this.usuario.email.split('@')[0]);
      }

      await this.exibirToast('Bem-vindo!', 'success');
      this.router.navigate(['/casa']);
    } catch (error: any) {
      this.tratarErro(error.code);
    }
  }

  async loginComGoogle() {
    try {
      const resultado = await this.authService.loginComGoogle();
      
      if (resultado?.user && resultado.user.displayName) {
        localStorage.setItem('usuario_logado', resultado.user.displayName);
      } else if (resultado?.user && resultado.user.email) {
        localStorage.setItem('usuario_logado', resultado.user.email.split('@')[0]);
      }

      await this.exibirToast('Bem-vindo com o Google!', 'success');
      this.router.navigate(['/casa']);
    } catch (error: any) {
      console.error(error);
      if (error.code === 'auth/popup-closed-by-user') {
        await this.exibirToast('Login cancelado.', 'warning');
      } else {
        await this.exibirToast('Erro ao logar com o Google.', 'danger');
      }
    }
  }

  async verificarEmailCadastrado() {
    if (!this.emailRecuperacao) {
      await this.exibirToast('Por favor, insira o e-mail.', 'warning');
      return;
    }

    const usuariosCadastrados = JSON.parse(localStorage.getItem('app_usuarios_cadastrados') || '[]');
    const usuarioExiste = usuariosCadastrados.find((u: any) => u.email === this.emailRecuperacao);

    if (!usuarioExiste) {
      await this.exibirToast('Este e-mail não está cadastrado no sistema.', 'danger');
      return;
    }

    try {
      await this.authService.redefinirSenha(this.emailRecuperacao);
      await this.exibirToast('E-mail de redefinição enviado! Verifique sua caixa de entrada.', 'success');
      this.emailRecuperacao = '';
      this.passoLogin = 'login';
    } catch (error: any) {
      console.error(error);
      await this.exibirToast('Erro ao enviar e-mail de recuperação. Tente novamente.', 'danger');
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
      duration: 3000,
      color: cor
    });
    await toast.present();
  }
}