import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router'; // CORRIGIDO: Importado RouterLink
import { 
  IonContent, 
  IonItem, 
  IonLabel, 
  IonInput, 
  IonButton, 
  IonIcon,
  IonHeader,   
  IonToolbar,  
  IonTitle,    
  ToastController 
} from '@ionic/angular/standalone';

import { AuthService } from '../services/auth';
import { ContasService } from '../services/contas.service';
import { addIcons } from 'ionicons';
import { mailOutline, lockClosedOutline, personOutline } from 'ionicons/icons';

@Component({
  selector: 'app-cadastro',
  templateUrl: './cadastro.page.html',
  styleUrls: ['./cadastro.page.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    RouterLink, // CORRIGIDO: Adicionado aqui para funcionar links no HTML
    IonContent, 
    IonItem, 
    IonLabel, 
    IonInput, 
    IonButton,
    IonIcon,
    IonHeader,   
    IonToolbar,  
    IonTitle     
  ]
})
export class CadastroPage {
  private authService = inject(AuthService);
  private contasService = inject(ContasService);
  private toastCtrl = inject(ToastController);
  private router = inject(Router);

  usuario = { nome: '', email: '', senha: '' };
  confirmarSenha = '';

  constructor() {
    addIcons({ mailOutline, lockClosedOutline, personOutline });
  }

  async realizarCadastro() {
    if (!this.usuario.nome || !this.usuario.email || !this.usuario.senha || !this.confirmarSenha) {
      this.exibirToast('Preencha todos os campos!', 'warning');
      return;
    }

    if (this.usuario.senha !== this.confirmarSenha) {
      this.exibirToast('As senhas não coincidem!', 'danger');
      return;
    }

    try {
      // 1. Cadastra no Firebase
      await this.authService.cadastrar(this.usuario.email, this.usuario.senha);
      
      // 2. Salva o nome no seu serviço de contas
      this.contasService.salvarUsuario(this.usuario.nome);

      // CORREÇÃO MÁGICA: Alimenta a lista local para a recuperação de senha funcionar!
      const usuariosLocais = JSON.parse(localStorage.getItem('app_usuarios_cadastrados') || '[]');
      usuariosLocais.push({
        nome: this.usuario.nome,
        email: this.usuario.email,
        senha: this.usuario.senha // Mantém atualizado para validação local posterior
      });
      localStorage.setItem('app_usuarios_cadastrados', JSON.stringify(usuariosLocais));

      this.exibirToast('Cadastro realizado com sucesso!', 'success');
      this.router.navigate(['/login']); 
    } catch (error: any) {
      console.error("ERRO COMPLETO:", error);
      this.tratarErro(error.code);
    }
  }

  private tratarErro(codigo: string) {
    let mensagem = 'Erro ao cadastrar: ' + codigo; 
    if (codigo === 'auth/email-already-in-use') mensagem = 'Este e-mail já está em uso.';
    if (codigo === 'auth/weak-password') mensagem = 'A senha deve ter pelo menos 6 caracteres.';
    if (codigo === 'auth/operation-not-allowed') mensagem = 'Habilite o login por E-mail no Console do Firebase!';
    
    this.exibirToast(mensagem, 'danger');
  }

  async exibirToast(mensagem: string, cor: string) {
    const toast = await this.toastCtrl.create({
      message: mensagem,
      duration: 3000,
      color: cor
    });
    toast.present();
  }
}