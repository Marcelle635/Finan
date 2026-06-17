import { Component, OnInit, inject } from '@angular/core'; 
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { 
  IonContent, 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonButtons, 
  IonBackButton, 
  IonIcon,
  ToastController 
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { eyeOutline, eyeOffOutline } from 'ionicons/icons';
import { ContasService } from '../services/contas.service';
import { AuthService } from '../services/auth';

@Component({
  selector: 'app-alterar-senha',
  templateUrl: './alterar-senha.page.html',
  styleUrls: ['./alterar-senha.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonBackButton,
    IonIcon
  ]
})
export class AlterarSenhaPage implements OnInit {
  nomeUsuario: string = '';
  
  novaSenha = '';
  confirmarNovaSenha = '';

  exibirNovaSenha = false;
  exibirConfirmarSenha = false;

  private contasService = inject(ContasService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private toastCtrl = inject(ToastController);

  constructor() {
    addIcons({ eyeOutline, eyeOffOutline });
  }

  ngOnInit() {
    this.nomeUsuario = this.contasService.buscarUsuario();
  }

  async alterarSenha() {
    if (!this.novaSenha || !this.confirmarNovaSenha) {
      await this.exibirToast('Por favor, preencha todos os campos.', 'warning');
      return;
    }

    if (this.novaSenha !== this.confirmarNovaSenha) {
      await this.exibirToast('As senhas não coincidem!', 'danger');
      return;
    }

    if (this.novaSenha.length < 6) {
      await this.exibirToast('A senha deve ter pelo menos 6 caracteres.', 'warning');
      return;
    }

    try {
      // 1. Atualiza a senha na nuvem do Firebase Authentication
      await this.authService.atualizarSenha(this.novaSenha);

      // 2. Sincroniza a senha no banco local (localStorage) para manter a consistência
      let usuariosCadastrados = JSON.parse(localStorage.getItem('app_usuarios_cadastrados') || '[]');
      const index = usuariosCadastrados.findIndex((u: any) => u.nome === this.nomeUsuario);

      if (index !== -1) {
        usuariosCadastrados[index].senha = this.novaSenha;
        localStorage.setItem('app_usuarios_cadastrados', JSON.stringify(usuariosCadastrados));
      }

      await this.exibirToast('Senha alterada com sucesso!', 'success');
      
      // Limpa os campos e retorna para a tela de configurações
      this.novaSenha = '';
      this.confirmarNovaSenha = '';
      this.router.navigate(['/configuracoes']);

    } catch (error: any) {
      console.error("ERRO AO ALTERAR SENHA:", error);
      
      // Tratamento para sessões antigas que exigem login recente
      if (error.code === 'auth/requires-recent-login') {
        await this.exibirToast('Por segurança, faça login novamente antes de alterar a senha.', 'danger');
        localStorage.removeItem('usuario_logado');
        this.router.navigate(['/login']);
      } else {
        await this.exibirToast('Erro ao atualizar a senha no servidor. Tente novamente.', 'danger');
      }
    }
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