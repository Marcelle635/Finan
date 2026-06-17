import { Component, OnInit } from '@angular/core'; 
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { 
  IonContent, 
  IonHeader, 
  IonItem, 
  IonLabel, 
  IonIcon, 
  IonAvatar, 
  IonList,
  NavController, // ➕ Utilizando o controlador nativo do Ionic para o histórico
  ActionSheetController 
} from '@ionic/angular/standalone';

// Importações diretas do ecossistema Firebase conforme seu modelo
import { Auth, onAuthStateChanged, signOut } from '@angular/fire/auth';
import { Firestore, collection, getDocs } from '@angular/fire/firestore';

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

interface Conta {
  nome: string;
  valor: number;
  vencimento?: string;
  status: 'pago' | 'pendente' | 'vencido'; 
}

@Component({
  selector: 'app-configuracao',
  templateUrl: './configuracao.page.html',
  styleUrls: ['./configuracao.page.scss'],   
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    RouterModule, 
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

  nomeUsuario: string = 'Usuário';
  primeiroNome: string = 'Usuário'; 
  avatarPadrao: string = 'https://ionicframework.com/docs/img/demos/avatar.svg';
  fotoUsuario: string = this.avatarPadrao;
  totalNotificacoes: number = 0;

  constructor(
    private auth: Auth,
    private firestore: Firestore,
    private router: Router,
    private navCtrl: NavController, // ➕ Injetado para controlar o retorno exato das abas
    private actionSheetCtrl: ActionSheetController
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
    // Inicializações básicas se necessário
  }

  ionViewWillEnter() {
    // Monitoramento do estado do usuário ativo e cálculo de notificações
    onAuthStateChanged(this.auth, (usuarioAtual) => {
      if (usuarioAtual) {
        // Trata e isola o nome de exibição
        if (usuarioAtual.displayName && usuarioAtual.displayName.trim() !== '') {
          this.nomeUsuario = usuarioAtual.displayName;
        } else if (usuarioAtual.email) {
          this.nomeUsuario = usuarioAtual.email.split('@')[0];
        }

        this.primeiroNome = this.nomeUsuario.trim().split(' ')[0] || 'Usuário';
        
        // Sincroniza a foto do perfil local vinculada ao usuário ativo
        const chaveFotoUsuario = 'foto_' + this.nomeUsuario;
        this.fotoUsuario = localStorage.getItem(chaveFotoUsuario) || this.avatarPadrao;

        // Calcula a quantidade de notificações direto do Firestore
        this.calcularQuantidadeNotificacoes(usuarioAtual.uid);
      } else {
        this.nomeUsuario = 'Usuário';
        this.primeiroNome = 'Usuário';
        this.fotoUsuario = this.avatarPadrao;
        this.totalNotificacoes = 0;
      }
    });
  }

  // Função responsável por retornar de forma inteligente para a aba de origem
  voltar() {
    this.navCtrl.back();
  }

  analisarDataVencimento(dataStr: string): Date | null {
    if (!dataStr) return null;
    let dataResultado: Date;

    if (dataStr.includes('-')) {
      const partes = dataStr.split('T')[0].split('-');
      dataResultado = new Date(parseInt(partes[0], 10), parseInt(partes[1], 10) - 1, parseInt(partes[2], 10));
    } else {
      const partes = dataStr.split('/');
      if (partes.length !== 3) return null;
      dataResultado = new Date(parseInt(partes[2], 10), parseInt(partes[1], 10) - 1, parseInt(partes[0], 10));
    }

    dataResultado.setHours(0, 0, 0, 0);
    return dataResultado;
  }

  async calcularQuantidadeNotificacoes(uid: string) {
    try {
      const contasRef = collection(this.firestore, `usuarios/${uid}/contas`);
      const querySnapshot = await getDocs(contasRef);
      
      let contador = 0;
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);

      querySnapshot.forEach((documento) => {
        const conta = documento.data() as Conta;

        if (conta.status === 'pendente' && conta.vencimento) {
          const dataVencimento = this.analisarDataVencimento(conta.vencimento);
          
          if (dataVencimento) {
            const diferencaTempo = dataVencimento.getTime() - hoje.getTime();
            const diferencaDias = Math.round(diferencaTempo / (1000 * 60 * 60 * 24));

            if (diferencaDias === 3 || diferencaDias === 1) {
              contador++;
            }
          }
        }
      });

      this.totalNotificacoes = contador;

    } catch (error) {
      console.error("Erro ao calcular total de notificações:", error);
    }
  }

  irParaNotificacoes() {
    this.router.navigate(['/notificacoes']);
  }

  irParaAlterarSenha() {
    this.router.navigate(['/alterar-senha']);
  }

  async logout() {
    try {
      await signOut(this.auth);
      localStorage.removeItem('usuario_logado'); 
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