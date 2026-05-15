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
  IonHeader,   // Adicionado para resolver o erro
  IonToolbar,  // Adicionado para resolver o erro
  IonTitle,    // Adicionado para resolver o erro
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
    IonContent, 
    IonItem, 
    IonLabel, 
    IonInput, 
    IonButton,
    IonIcon,
    IonHeader,   // IMPORTANTE: Adicionado aqui também
    IonToolbar,  // IMPORTANTE: Adicionado aqui também
    IonTitle     // IMPORTANTE: Adicionado aqui também
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
      await this.authService.cadastrar(this.usuario.email, this.usuario.senha);
      this.contasService.salvarUsuario(this.usuario.nome);
      this.exibirToast('Cadastro realizado com sucesso!', 'success');
      this.router.navigate(['/login']); 
    } catch (error: any) {
      console.error("ERRO COMPLETO:", error); // Isso ajuda a ver o erro no F12
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