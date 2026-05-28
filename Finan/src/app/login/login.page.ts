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

  // Variável para controlar qual fluxo/passo exibir na tela
  passoLogin: 'login' | 'verificarEmail' | 'novaSenha' = 'login';

  usuario = {
    email: '',
    senha: ''
  };

  // Variáveis para o controle de redefinição
  emailRecuperacao: string = '';
  novaSenha: string = '';
  confirmarNovaSenha: string = '';

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
      this.router.navigate(['/casa']);
    } catch (error: any) {
      this.tratarErro(error.code);
    }
  }

  async loginComGoogle() {
    try {
      await this.authService.loginComGoogle();
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

  // Verifica se o e-mail existe na base de dados fictícia do localStorage
  async verificarEmailCadastrado() {
    if (!this.emailRecuperacao) {
      await this.exibirToast('Por favor, insira o e-mail.', 'warning');
      return;
    }

    // Adapte aqui para ler a chave onde os usuários cadastrados ficam no seu localStorage
    const usuariosCadastrados = JSON.parse(localStorage.getItem('app_usuarios_cadastrados') || '[]');
    
    // Procura se existe algum usuário com esse e-mail
    const usuarioExiste = usuariosCadastrados.find((u: any) => u.email === this.emailRecuperacao);

    if (usuarioExiste) {
      await this.exibirToast('E-mail validado! Prossiga criando sua nova senha.', 'success');
      this.passoLogin = 'novaSenha'; // Avança para a etapa de criação de senha
    } else {
      await this.exibirToast('Este e-mail não está cadastrado no sistema.', 'danger');
    }
  }

  // Salva a nova senha na base do localStorage
  async salvarNovaSenha() {
    if (!this.novaSenha || !this.confirmarNovaSenha) {
      await this.exibirToast('Preencha os campos de senha.', 'warning');
      return;
    }

    if (this.novaSenha !== this.confirmarNovaSenha) {
      await this.exibirToast('As senhas não coincidem!', 'danger');
      return;
    }

    // Atualiza a senha do usuário correspondente no localStorage
    let usuariosCadastrados = JSON.parse(localStorage.getItem('app_usuarios_cadastrados') || '[]');
    const index = usuariosCadastrados.findIndex((u: any) => u.email === this.emailRecuperacao);

    if (index !== -1) {
      usuariosCadastrados[index].senha = this.novaSenha;
      localStorage.setItem('app_usuarios_cadastrados', JSON.stringify(usuariosCadastrados));
      
      await this.exibirToast('Senha alterada com sucesso! Faça seu login.', 'success');
      
      // Limpa os campos e retorna ao login original
      this.novaSenha = '';
      this.confirmarNovaSenha = '';
      this.emailRecuperacao = '';
      this.passoLogin = 'login';
    } else {
      await this.exibirToast('Erro crítico ao atualizar senha.', 'danger');
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