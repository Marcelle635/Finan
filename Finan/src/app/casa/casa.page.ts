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
import { Firestore, collection, collectionData, addDoc, doc, updateDoc, deleteDoc, query, where } from '@angular/fire/firestore';
import { Subscription } from 'rxjs';

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
  imageOutline,     
  trashOutline,     
  closeOutline      
} from 'ionicons/icons';

@Component({
  selector: 'app-casa',
  templateUrl: './casa.page.html',
  styleUrls: ['./casa.page.scss'],
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
export class CasaPage implements OnInit, OnDestroy {
  private firestore = inject(Firestore); // Injeta o Firestore configurado no main.ts
  private contasService = inject(ContasService);
  private authService = inject(AuthService);
  private actionSheetCtrl = inject(ActionSheetController);

  nomeUsuario: string = '';
  primeiroNome: string = '';
  avatarPadrao: string = 'https://ionicframework.com/docs/img/demos/avatar.svg';
  fotoUsuario: string = this.avatarPadrao;
  
  contas: any[] = []; 
  contasFiltradas: any[] = [];
  filtroAtivo: 'pago' | 'pendente' | 'vencido' = 'pendente';
  totalGastos: number = 0;
  
  totalEntradas: number = 0;
  exibirSaldo: boolean = false;

  isModalAberto = false;
  novaConta = {
    titulo: '',
    valor: null as number | null,
    vencimento: ''
  };

  dataAncorada: Date = new Date(); 
  textoMesAno: string = '';
  dataInicioMes: string = '';
  dataFimMes: string = '';
  statusMesTexto: string = '';

  // Guarda a inscrição do banco para evitar vazamento de memória
  private contasSubscription!: Subscription;

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
      imageOutline,
      trashOutline,
      closeOutline
    });
  }

  ngOnInit() {
    this.inicializarSeletorData();

    if (this.authService.obterAuth) {
      this.authService.obterAuth.onAuthStateChanged((firebaseUser) => {
        this.configurarUsuario(firebaseUser);
        this.escutarContasFirebase();
      });
    } else {
      this.configurarUsuario(null);
      this.escutarContasFirebase();
    }
  }

  ionViewWillEnter() {
    const firebaseUser = this.authService.obterAuth?.currentUser;
    this.configurarUsuario(firebaseUser);
    this.escutarContasFirebase();
  }

  ngOnDestroy() {
    // Cancela a escuta do Firebase se mudar de página
    if (this.contasSubscription) {
      this.contasSubscription.unsubscribe();
    }
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
    this.escutarContasFirebase(); // Recarrega buscando as contas do novo mês
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

    this.carregarSaldoDasEntradas();
  }

  // 🔄 REAL-TIME MÁGICO: Escuta o Firestore filtrando por usuário
  escutarContasFirebase() {
    if (this.contasSubscription) {
      this.contasSubscription.unsubscribe();
    }

    const contasRef = collection(this.firestore, 'contas');
    // Busca apenas documentos pertencentes ao usuário logado
    const q = query(contasRef, where('usuario', '==', this.nomeUsuario));

    this.contasSubscription = collectionData(q, { idField: 'id' }).subscribe((todasContas: any[]) => {
      // Filtra as contas que pertencem ao mês selecionado na interface
      this.contas = todasContas.filter((conta: any) => this.isContaNoMesSelecionado(conta.vencimento));
      
      this.atualizarStatusPorData();
      this.calcularTotal(); 
      this.filtrar(this.filtroAtivo);
    });
  }

  isContaNoMesSelecionado(vencimento: string): boolean {
    if (!vencimento) return false;
    const [ano, mes] = vencimento.split('-'); 
    const anoSelecionado = this.dataAncorada.getFullYear();
    const mesSelecionado = this.dataAncorada.getMonth() + 1; 

    return Number(ano) === anoSelecionado && Number(mes) === mesSelecionado;
  }

  carregarSaldoDasEntradas() {
    // Mantido temporariamente do localStorage, mas recomendo passar para o Firebase depois!
    const todasEntradas = JSON.parse(localStorage.getItem('app_todas_entradas') || '[]');
    const entradasDoUsuario = todasEntradas.filter((entrada: any) => entrada.usuario === this.nomeUsuario);
    const somaEntradas = entradasDoUsuario.reduce((acc: number, entrada: any) => acc + entrada.valor, 0);

    const somaGastosPagos = this.contas
      .filter(conta => conta.status === 'pago')
      .reduce((acc: number, conta: any) => acc + conta.valor, 0);

    this.totalEntradas = somaEntradas - somaGastosPagos;
  }

  alternarVisibilidadeSaldo() {
    this.exibirSaldo = !this.exibirSaldo;
  }

  atualizarStatusPorData() {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    this.contas.forEach(conta => {
      if (conta.status !== 'pago') {
        const [ano, mes, dia] = conta.vencimento.split('-');
        const dataVencimento = new Date(Number(ano), Number(mes) - 1, Number(dia));
        
        if (dataVencimento < hoje) {
          conta.status = 'vencido';
        } else {
          conta.status = 'pendente';
        }
      }
    });
  }

  filtrar(status: 'pago' | 'pendente' | 'vencido') {
    this.filtroAtivo = status;
    this.contasFiltradas = this.contas.filter(c => c.status === status);
  }

  calcularTotal() {
    this.totalGastos = this.contas.reduce((acc, conta) => acc + conta.valor, 0);
  }

  abrirModal(abrir: boolean) {
    this.isModalAberto = abrir;
    if (!abrir) {
      this.novaConta = { titulo: '', valor: null, vencimento: '' };
    }
  }

  // 💾 ADICIONAR NO FIREBASE
  async adicionarGasto() {
    if (!this.novaConta.titulo || !this.novaConta.valor || !this.novaConta.vencimento) {
      alert('Por favor, preencha todos os campos!');
      return;
    }

    const nova = {
      usuario: this.nomeUsuario, 
      titulo: this.novaConta.titulo,
      valor: Number(this.novaConta.valor),
      vencimento: this.novaConta.vencimento, 
      status: 'pendente' 
    };

    // Salva direto na nuvem!
    const contasRef = collection(this.firestore, 'contas');
    await addDoc(contasRef, nova);

    const [anoGasto, mesGasto] = this.novaConta.vencimento.split('-');
    this.dataAncorada = new Date(Number(anoGasto), Number(mesGasto) - 1, 1);
    
    this.inicializarSeletorData();
    this.abrirModal(false);
  }

  // 🆙 ATUALIZAR NO FIREBASE
  async marcarComoPago(id: string) {
    const documentoRef = doc(this.firestore, `contas/${id}`);
    await updateDoc(documentoRef, { status: 'pago' });
  }

  // ❌ DELETAR NO FIREBASE
  async excluirConta(id: string) {
    const documentoRef = doc(this.firestore, `contas/${id}`);
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
            const elementoInput = document.getElementById('seletorArquivoHome') as HTMLInputElement;
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