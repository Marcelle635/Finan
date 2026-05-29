import { Component, OnInit, OnDestroy, inject } from '@angular/core'; 
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
  ActionSheetController 
} from '@ionic/angular/standalone';
import { ContasService } from '../services/contas.service';
import { AuthService } from '../services/auth'; 
import { addIcons } from 'ionicons';
import { 
  settings, 
  notificationsOutline, 
  lockClosedOutline, 
  chevronForwardOutline,
  trashOutline,     
  imageOutline,     
  closeOutline      
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
export class ConfiguracoesPage implements OnInit, OnDestroy {
  private contasService = inject(ContasService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private actionSheetCtrl = inject(ActionSheetController);

  nomeUsuario: string = '';
  primeiroNome: string = ''; 
  avatarPadrao: string = 'https://ionicframework.com/docs/img/demos/avatar.svg';
  fotoUsuario: string = this.avatarPadrao;

  constructor() {
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
    // MONITORAMENTO EM TEMPO REAL: Garante consistência de dados do usuário ativo
    if (this.authService.obterAuth) {
      this.authService.obterAuth.onAuthStateChanged((firebaseUser) => {
        this.carregarDadosUsuario(firebaseUser);
      });
    } else {
      this.carregarDadosUsuario(null);
    }
  }

  ionViewWillEnter() {
    const firebaseUser = this.authService.obterAuth?.currentUser;
    this.carregarDadosUsuario(firebaseUser); 
  }

  ngOnDestroy() {
    // Hooks de encerramento de ciclo tratados de forma limpa
  }

  carregarDadosUsuario(firebaseUser: any | null = null) {
    const nomeLocal = this.contasService.buscarUsuario();
    
    // Identificação prioritária padronizada com o restante do ecossistema do app
    if (firebaseUser && firebaseUser.displayName) {
      this.nomeUsuario = firebaseUser.displayName;
    } else if (nomeLocal && !nomeLocal.includes('@')) {
      this.nomeUsuario = nomeLocal;
    } else if (firebaseUser && firebaseUser.email) {
      this.nomeUsuario = firebaseUser.email.split('@')[0];
    } else {
      this.nomeUsuario = 'Usuário';
    }

    // Isola e formata o primeiro nome para a View
    this.primeiroNome = this.nomeUsuario.trim().split(' ')[0] || 'Usuário';
    
    // Sincroniza a chave da foto vinculada estritamente ao usuário ativo
    const chaveFotoUsuario = 'foto_' + this.nomeUsuario;
    this.fotoUsuario = localStorage.getItem(chaveFotoUsuario) || this.avatarPadrao;
  }

  irParaNotificacoes() {
    this.router.navigate(['/notificacoes']);
  }

  irParaAlterarSenha() {
    this.router.navigate(['/alterar-senha']);
  }

  async logout() {
    try {
      await this.authService.logout(); 
      
      // Limpeza higiênica de chaves legadas de sessão antiga
      localStorage.removeItem('usuario_logado'); 
      
      // Redireciona o usuário de volta à estaca zero de autenticação
      this.router.navigate(['/login']);
    } catch (erro) {
      console.error('Erro ao efetuar logout:', erro);
    }
  }

  async dispararSeletorArquivo() {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Foto de Perfil',
      buttons: [
        {
          text: 'Escolher Nova Foto',
          icon: 'image-outline',
          handler: () => {
            const elementoInput = document.getElementById('seletorArquivoConfig') as HTMLInputElement;
            if (elementoInput) elementoInput.click();
          }
        },
        {
          text: 'Deixar Sem Foto',
          role: 'destructive',
          icon: 'trash-outline',
          handler: () => this.removerFoto()
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