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
  IonFooter, 
  IonTabBar, 
  IonTabButton,
  IonModal,
  ActionSheetController 
} from '@ionic/angular/standalone'; 

// Importações do Firebase Firestore e RxJS
import { Firestore, collection, collectionData, addDoc, doc, deleteDoc, updateDoc, query, where } from '@angular/fire/firestore';
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
  heart,
  trashOutline,
  checkmarkCircleOutline,
  cartOutline,
  giftOutline,
  imageOutline,     
  closeOutline      
} from 'ionicons/icons';

@Component({
  selector: 'app-desejos',
  templateUrl: './desejos.page.html',
  styleUrls: ['./desejos.page.scss'],
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
    IonFooter, 
    IonTabBar, 
    IonTabButton,
    IonModal
  ]
})
export class DesejosPage implements OnInit, OnDestroy {
  private firestore = inject(Firestore); // Injeta o banco do Firestore
  private contasService = inject(ContasService);
  private authService = inject(AuthService);
  private actionSheetCtrl = inject(ActionSheetController);

  nomeUsuario: string = '';
  primeiroNome: string = ''; 
  avatarPadrao: string = 'https://ionicframework.com/docs/img/demos/avatar.svg';
  fotoUsuario: string = this.avatarPadrao;
  
  totalEntradas: number = 0;
  exibirSaldo: boolean = false;

  totalDesejado: number = 0;
  totalConquistado: number = 0;
  isModalAberto: boolean = false;

  desejosFiltrados: any[] = [];

  novoDesejo = {
    titulo: '',
    valor: null as number | null
  };

  dataAncorada: Date = new Date();
  textoMesAno: string = '';
  dataInicioMes: string = '';
  dataFimMes: string = '';
  statusMesTexto: string = '';

  // Inscrição combinada para escutar desejos, contas e entradas em real-time
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
      heart,
      trashOutline,
      checkmarkCircleOutline,
      cartOutline,
      giftOutline,
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
    // Cancela a escuta ativa para evitar vazamento de memória e lentidão
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

  // 🔄 SINCRONIZAÇÃO TRIPLA EM TEMPO REAL
  escutarDadosFirebase() {
    if (this.dadosSubscription) {
      this.dadosSubscription.unsubscribe();
    }

    const desejosRef = collection(this.firestore, 'desejos');
    const qDesejos = query(desejosRef, where('usuario', '==', this.nomeUsuario));

    const entradasRef = collection(this.firestore, 'entradas');
    const qEntradas = query(entradasRef, where('usuario', '==', this.nomeUsuario));

    const contasRef = collection(this.firestore, 'contas');
    const qContas = query(contasRef, where('usuario', '==', this.nomeUsuario));

    // Combina a escuta das 3 coleções simultaneamente
    this.dadosSubscription = combineLatest([
      collectionData(qDesejos, { idField: 'id' }),
      collectionData(qEntradas, { idField: 'id' }),
      collectionData(qContas, { idField: 'id' })
    ]).subscribe(([todosDesejos, todasEntradas, todasContas]) => {
      
      // 1. Atualiza e renderiza a lista de desejos
      this.desejosFiltrados = todosDesejos;

      // 2. Recalcula os painéis de resumo (Total Desejado vs Conquistado)
      this.totalDesejado = todosDesejos
        .filter((item: any) => !item.conquistado)
        .reduce((acc, item: any) => acc + (item.valor || 0), 0);
      
      this.totalConquistado = todosDesejos
        .filter((item: any) => item.conquistado)
        .reduce((acc, item: any) => acc + (item.valor || 0), 0);

      // 3. Recalcula o Saldo Geral do Cabeçalho
      const somaEntradas = todasEntradas.reduce((acc, entrada) => acc + (entrada['valor'] || 0), 0);
      const gastosPagos = todasContas.filter((conta: any) => conta.status === 'pago');
      const somaGastosPagos = gastosPagos.reduce((acc, conta) => acc + (conta['valor'] || 0), 0);

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
  }

  abrirModal(abrir: boolean) {
    this.isModalAberto = abrir;
    if (!abrir) {
      this.novoDesejo = { titulo: '', valor: null };
    }
  }

  alternarVisibilidadeSaldo() {
    this.exibirSaldo = !this.exibirSaldo;
  }

  // 💾 SALVAR DESEJO NO FIREBASE
  async adicionarDesejo() {
    if (!this.novoDesejo.titulo || !this.novoDesejo.valor) {
      alert('Preencha todos os campos!');
      return;
    }

    const novoItem = {
      usuario: this.nomeUsuario, 
      titulo: this.novoDesejo.titulo,
      valor: Number(this.novoDesejo.valor),
      conquistado: false
    };

    const desejosRef = collection(this.firestore, 'desejos');
    await addDoc(desejosRef, novoItem);

    this.abrirModal(false);
  }

  // 🔄 ALTERNAR STATUS (COMPREI / CONQUISTADO) NO FIREBASE
  async alternarStatusDesejo(desejo: any) {
    const documentoRef = doc(this.firestore, `desejos/${desejo.id}`);
    await updateDoc(documentoRef, {
      conquistado: !desejo.conquistado
    });
  }

  // ❌ EXCLUIR DESEJO NO FIREBASE
  async excluirDesejo(id: string) {
    const documentoRef = doc(this.firestore, `desejos/${id}`);
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
            const elementoInput = document.getElementById('seletorArquivoDesejos') as HTMLInputElement;
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