import { Component, OnInit, inject } from '@angular/core'; // CORRIGIDO: Importado o 'inject' aqui
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
  IonItem, 
  IonInput, 
  IonButton, 
  IonIcon,
  ToastController 
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { eyeOutline, eyeOffOutline } from 'ionicons/icons';
import { ContasService } from '../services/contas.service';

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
    IonItem,
    IonInput,
    IonButton,
    IonIcon
  ]
})
export class AlterarSenhaPage implements OnInit {
  nomeUsuario: string = '';
  
  novaSenha = '';
  confirmarNovaSenha = '';

  exibirNovaSenha = false;
  exibirConfirmarSenha = false;

  // CORRIGIDO: Injeção de dependência moderna usando o 'inject' para evitar erros no constructor
  private contasService = inject(ContasService);
  private router = inject(Router);
  private toastCtrl = inject(ToastController);

  constructor() {
    addIcons({ eyeOutline, eyeOffOutline });
  }

  // O Angular exige este método exato por causa do 'implements OnInit'
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

    let usuariosCadastrados = JSON.parse(localStorage.getItem('app_usuarios_cadastrados') || '[]');
    const index = usuariosCadastrados.findIndex((u: any) => u.nome === this.nomeUsuario);

    if (index !== -1) {
      usuariosCadastrados[index].senha = this.novaSenha;
      localStorage.setItem('app_usuarios_cadastrados', JSON.stringify(usuariosCadastrados));

      await this.exibirToast('Senha alterada com sucesso!', 'success');
      this.router.navigate(['/configuracoes']);
    } else {
      await this.exibirToast('Erro ao identificar usuário logado.', 'danger');
    }
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