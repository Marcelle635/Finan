import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router'; 
import { 
  IonContent, 
  IonHeader, 
  IonItem, 
  IonLabel, 
  IonIcon, 
  IonAvatar, 
  IonList,
  ActionSheetController // Importado para gerenciar as opções da foto de perfil
} from '@ionic/angular/standalone';
import { ContasService } from '../services/contas.service';
import { addIcons } from 'ionicons';
import { 
  settings, 
  notificationsOutline, 
  lockClosedOutline, 
  chevronForwardOutline,
  trashOutline,     // Ícone adicionado para a opção de remover foto
  imageOutline,     // Ícone adicionado para a opção de escolher foto
  closeOutline      // Ícone adicionado para o botão cancelar do menu
} from 'ionicons/icons';

@Component({
  selector: 'app-configuracao',
  templateUrl: './configuracao.page.html',
  styleUrls: ['./configuracao.page.scss'],   
  standalone: true,
  imports: [
    CommonModule, 
    RouterLink, 
    IonContent, 
    IonHeader, 
    IonItem, 
    IonLabel, 
    IonIcon, 
    IonAvatar, 
    IonList
  ]
})
export class ConfiguracoesPage implements OnInit {
  nomeUsuario: string = '';
  avatarPadrao: string = 'https://ionicframework.com/docs/img/demos/avatar.svg';
  fotoUsuario: string = this.avatarPadrao;

  constructor(
    private contasService: ContasService,
    private router: Router,
    private actionSheetCtrl: ActionSheetController // Injetando o controlador de menu
  ) {
    addIcons({ 
      settings, 
      notificationsOutline, 
      lockClosedOutline, 
      chevronForwardOutline,
      trashOutline,
      imageOutline,
      closeOutline
    });
  }

  ngOnInit() {
    this.carregarDadosUsuario();
  }

  ionViewWillEnter() {
    this.carregarDadosUsuario(); // Garante a atualização da foto ao entrar na tela
  }

  carregarDadosUsuario() {
    this.nomeUsuario = this.contasService.buscarUsuario();
    
    // Configura a foto dinamicamente com base no usuário atual logado
    const chaveFotoUsuario = 'foto_' + this.nomeUsuario;
    this.fotoUsuario = localStorage.getItem(chaveFotoUsuario) || this.avatarPadrao;
  }

  irParaNotificacoes() {
    this.router.navigate(['/notificacoes']);
  }

  irParaAlterarSenha() {
    this.router.navigate(['/alterar-senha']);
  }

  logout() {
    localStorage.removeItem('usuario_logado'); 
    console.log('Usuário deslogado com sucesso.');
    this.router.navigate(['/login']);
  }

  // Abre as opções para alterar ou deixar sem foto
  async dispararSeletorArquivo() {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Foto de Perfil',
      buttons: [
        {
          text: 'Escolher Nova Foto',
          icon: 'image-outline',
          handler: () => {
            const elementoInput = document.getElementById('seletorArquivoConfig') as HTMLInputElement;
            if (elementoInput) {
              elementoInput.click();
            }
          }
        },
        {
          text: 'Deixar Sem Foto',
          role: 'destructive',
          icon: 'trash-outline',
          handler: () => {
            this.removerFoto();
          }
        },
        {
          text: 'Cancelar',
          role: 'cancel',
          icon: 'close-outline'
        }
      ]
    });
    await actionSheet.present();
  }

  aoSelecionarFoto(event: any) {
    const arquivo = event.target.files[0];
    if (arquivo) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.fotoUsuario = e.target.result;
        
        const chaveFotoUsuario = 'foto_' + this.nomeUsuario;
        localStorage.setItem(chaveFotoUsuario, this.fotoUsuario);
      };
      reader.readAsDataURL(arquivo);
    }
  }

  removerFoto() {
    this.fotoUsuario = this.avatarPadrao;
    const chaveFotoUsuario = 'foto_' + this.nomeUsuario;
    localStorage.removeItem(chaveFotoUsuario);
  }
}