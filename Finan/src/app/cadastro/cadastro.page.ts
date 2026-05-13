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

// Importação do Serviço e Ícones
import { AuthService } from '../services/auth';
import { addIcons } from 'ionicons';
import { mailOutline, lockClosedOutline, personAddOutline } from 'ionicons/icons';

@Component({
  selector: 'app-cadastro',
  templateUrl: './cadastro.page.html',
  styleUrls: ['./cadastro.page.scss'], // Certifique-se de que o SCSS está vinculado aqui
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
export class CadastroPage {
  private authService = inject(AuthService);
  private toastCtrl = inject(ToastController);
  private router = inject(Router);

  // Objeto atualizado para refletir os campos da imagem CADASTRO.PNG
  usuario = { 
    nome: '', 
    email: '', 
    senha: '' 
  };
  
  confirmarSenha = ''; // Variável para a validação do segundo campo de senha

  constructor() {
    // Registra os ícones para uso no HTML
    addIcons({ mailOutline, lockClosedOutline, personAddOutline });
  }

  async realizarCadastro() {
    // Validação básica de preenchimento
    if (!this.usuario.nome || !this.usuario.email || !this.usuario.senha || !this.confirmarSenha) {
      this.exibirToast('Preencha todos os campos!', 'warning');
      return;
    }

    // Validação de igualdade das senhas (essencial para a UX da imagem)
    if (this.usuario.senha !== this.confirmarSenha) {
      this.exibirToast('As senhas não coincidem!', 'danger');
      return;
    }

    try {
      // O Firebase Auth usa email e senha para criar a conta
      await this.authService.cadastrar(this.usuario.email, this.usuario.senha);
      
      this.exibirToast('Cadastro realizado com sucesso!', 'success');
      this.router.navigate(['/home']); 
    } catch (error: any) {
      this.tratarErro(error.code);
    }
  }

  private tratarErro(codigo: string) {
    let mensagem = 'Erro ao cadastrar.';
    if (codigo === 'auth/email-already-in-use') mensagem = 'E-mail já cadastrado.';
    if (codigo === 'auth/weak-password') mensagem = 'Senha muito fraca (mínimo 6 caracteres).';
    if (codigo === 'auth/invalid-email') mensagem = 'E-mail inválido.';
    
    this.exibirToast(mensagem, 'danger');
  }

  async exibirToast(mensagem: string, cor: string) {
    const toast = await this.toastCtrl.create({
      message: mensagem,
      duration: 2000,
      color: cor
    });
    toast.present();
  }
}