import { Component, OnInit, OnDestroy, inject } from '@angular/core'; 
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { 
  IonContent, 
  IonHeader, 
  IonItem, 
  IonLabel, 
  IonIcon, 
  IonAvatar, 
  IonFabButton, 
  IonCard, 
  IonCardContent, 
  IonFooter, 
  IonTabBar, 
  IonTabButton,
  IonModal,
  ActionSheetController 
} from '@ionic/angular/standalone'; 

// Importações do Firebase Firestore
import { Firestore, collection, collectionData, addDoc, doc, deleteDoc, query, where } from '@angular/fire/firestore';
import { Subscription, combineLatest } from 'rxjs';

import { ContasService } from '../services/contas.service';
import { AuthService } from '../services/auth'; 
import { addIcons } from 'ionicons';
import { 
  settings, 
  settingsOutline, 
  eyeOutline,      
  eyeOffOutline, 
  chevronBackOutline, 
  chevronForwardOutline, 
  add, 
  walletOutline, 
  homeOutline, 
  trendingUpOutline, 
  heartOutline,
  trashOutline,
  imageOutline,     
  closeOutline      
} from 'ionicons/icons';

@Component({
  selector: 'app-entradas',
  templateUrl: './entradas.page.html',
  styleUrls: ['./entradas.page.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    RouterLink,
    IonContent, 
    IonHeader, 
    IonItem, 
    IonLabel, 
    IonIcon, 
    IonAvatar, 
    IonFabButton, 
    IonCard, 
    IonCardContent, 
    IonFooter, 
    IonTabBar, 
    IonTabButton,
    IonModal
  ]
})
export class EntradasPage implements OnInit, OnDestroy {
  private firestore = inject(Firestore); // Injeta o banco Firestore
  private contasService = inject(ContasService);
  private authService = inject(AuthService);
  private actionSheetCtrl = inject(ActionSheetController);

  nomeUsuario: string = '';
  primeiroNome: string = ''; 
  avatarPadrao: string = 'https://ionicframework.com/docs/img/demos/avatar.svg';
  fotoUsuario: string = this.avatarPadrao;
  
  totalEntradas: number = 0; 
  isModalAberto: boolean = false;
  exibirSaldo: boolean = false;

  entradasFiltradas: any[] = [];

  novaEntrada = {
    titulo: '',
    valor: null as number | null,
    categoria: 'Salário'
  };

  dataAncorada: Date = new Date();
  textoMesAno: string = '';
  dataInicioMes: string = '';
  dataFimMes: string = '';
  statusMesTexto: string = '';

  // Inscrição combinada para escutar entradas e contas ao mesmo tempo
  private dadosSubscription!: Subscription;

  constructor() {
    addIcons({ 
      settings,
      settingsOutline, 
      eyeOutline, 
      eyeOffOutline, 
      chevronBackOutline, 
      chevronForwardOutline, 
      add, 
      walletOutline, 
      homeOutline, 
      trendingUpOutline, 
      heartOutline,
      trashOutline,
      imageOutline,
      closeOutline
    });
  }

  ngOnInit() {
    this.inicializarSeletorData();
    
    if (this.authService.obterAuth) {
      this.authService.obterAuth.onAuthStateChanged((firebaseUser) => {
        this.configurarUsuario(firebaseUser);
        this.escutarDadosFirebase();
      });
    } else {
      this.configurarUsuario(null);
      this.escutarDadosFirebase();
    }
  }

  ionViewWillEnter() {
    const firebaseUser = this.authService.obterAuth?.currentUser;
    this.configurarUsuario(firebaseUser);
    this.escutarDadosFirebase();
  }

  ngOnDestroy() {
    // Evita vazamento de memória cancelando as escutas em tempo real
    if (this.dadosSubscription) {
      this.dadosSubscription.unsubscribe();
    }
  }

  configurarUsuario(firebaseUser: any | null) {
    const nomeLocal = this.contasService.buscarUsuario();
    
    if (firebaseUser && firebaseUser.displayName) {
      this.nomeUsuario = firebaseUser.displayName;
    } else if (nomeLocal && !nomeLocal.includes('@')) {
      this.nomeUsuario = nomeLocal;
    } else if (firebaseUser && firebaseUser.email) {
      this.nomeUsuario = firebaseUser.email.split('@')[0];
    } else {
      this.nomeUsuario = 'Usuário';
    }

    this.primeiroNome = this.nomeUsuario.trim().split(' ')[0] || 'Usuário';
    
    const chaveFotoUsuario = 'foto_' + this.nomeUsuario;
    this.fotoUsuario = localStorage.getItem(chaveFotoUsuario) || this.avatarPadrao;
  }

  // 🔄 ESCUTA EM TEMPO REAL: Entradas e Contas unificadas para calcular o saldo dinamicamente
  escutarDadosFirebase() {
    if (this.dadosSubscription) {
      this.dadosSubscription.unsubscribe();
    }

    const entradasRef = collection(this.firestore, 'entradas');
    const qEntradas = query(entradasRef, where('usuario', '==', this.nomeUsuario));

    const contasRef = collection(this.firestore, 'contas');
    const qContas = query(contasRef, where('usuario', '==', this.nomeUsuario));

    // O combineLatest garante que se qualquer alteração ocorrer em contas ou entradas, a tela recalcula
    this.dadosSubscription = combineLatest([
      collectionData(qEntradas, { idField: 'id' }),
      collectionData(qContas, { idField: 'id' })
    ]).subscribe(([todasEntradas, todasContas]) => {
      
      // Armazena as entradas obtidas da nuvem
      this.entradasFiltradas = todasEntradas;

      // Cálculos matemáticos do Saldo Geral atualizado em real-time
      const somaEntradas = todasEntradas.reduce((acc, entrada) => acc + (entrada['valor'] || 0), 0);
      
      const gastosPagosDoUsuario = todasContas.filter((conta: any) => conta.status === 'pago');
      const somaGastosPagos = gastosPagosDoUsuario.reduce((acc, conta) => acc + (conta['valor'] || 0), 0);

      this.totalEntradas = somaEntradas - somaGastosPagos;
    });
  }

  inicializarSeletorData() {
    const meses = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    const ano = this.dataAncorada.getFullYear();
    const mesIndex = this.dataAncorada.getMonth();

    this.textoMesAno = `${meses[mesIndex]} de ${ano}`;
    const mesFormatado = String(mesIndex + 1).padStart(2, '0');
    this.dataInicioMes = `01/${mesFormatado}/${ano}`;

    const ultimoDia = new Date(ano, mesIndex + 1, 0).getDate();
    this.dataFimMes = `${String(ultimoDia).padStart(2, '0')}/${mesFormatado}/${ano}`;

    const hoje = new Date();
    this.statusMesTexto = (ano === hoje.getFullYear() && mesIndex === hoje.getMonth()) ? 'Mês Atual' : '';
  }

  mudarMes(direcao: number) {
    this.dataAncorada.setMonth(this.dataAncorada.getMonth() + direcao);
    this.inicializarSeletorData();
    // Pronto para aplicar filtros mensais na nuvem se você decidir usar datas nas suas entradas futuramente!
  }

  abrirModal(abrir: boolean) {
    this.isModalAberto = abrir;
    if (!abrir) {
      this.novaEntrada = { titulo: '', valor: null, categoria: 'Salário' };
    }
  }

  alternarVisibilidadeSaldo() {
    this.exibirSaldo = !this.exibirSaldo;
  }

  // 💾 ADICIONAR ENTRADA NO FIREBASE
  async adicionarEntrada() {
    if (!this.novaEntrada.titulo || !this.novaEntrada.valor) {
      alert('Preencha os campos obrigatórios!');
      return;
    }
    
    const novaObjetoEntrada = {
      usuario: this.nomeUsuario, 
      titulo: this.novaEntrada.titulo,
      categoria: this.novaEntrada.categoria,
      valor: Number(this.novaEntrada.valor)
    };

    const entradasRef = collection(this.firestore, 'entradas');
    await addDoc(entradasRef, novaObjetoEntrada);

    this.abrirModal(false);
  }

  // ❌ DELETAR ENTRADA NO FIREBASE
  async excluirEntrada(id: string) {
    const documentoRef = doc(this.firestore, `entradas/${id}`);
    await deleteDoc(documentoRef);
  }

  async dispararSeletorArquivo() {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Foto de Perfil',
      buttons: [
        {
          text: 'Escolher Nova Foto',
          icon: 'image-outline',
          handler: () => {
            const elementoInput = document.getElementById('seletorArquivoEntradas') as HTMLInputElement;
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