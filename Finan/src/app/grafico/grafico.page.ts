import { Component, OnInit, OnDestroy, inject } from '@angular/core'; 
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { 
  IonContent, 
  IonHeader, 
  IonItem, 
  IonLabel, 
  IonIcon, 
  IonAvatar, 
  IonFooter, 
  IonTabBar, 
  IonTabButton,
  ActionSheetController 
} from '@ionic/angular/standalone'; 

// Importações do Firebase Firestore
import { Firestore, collection, collectionData, query, where } from '@angular/fire/firestore';
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
  walletOutline, 
  homeOutline, 
  trendingUp, 
  heartOutline,
  trashOutline,     
  imageOutline,     
  closeOutline      
} from 'ionicons/icons';

@Component({
  selector: 'app-grafico',
  templateUrl: './grafico.page.html',
  styleUrls: ['./grafico.page.scss'],
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
    IonFooter, 
    IonTabBar, 
    IonTabButton
  ]
})
export class GraficoPage implements OnInit, OnDestroy {
  private firestore = inject(Firestore); // Injeta o Firestore
  private contasService = inject(ContasService);
  private authService = inject(AuthService);
  private actionSheetCtrl = inject(ActionSheetController);

  nomeUsuario: string = '';
  primeiroNome: string = ''; 
  avatarPadrao: string = 'https://ionicframework.com/docs/img/demos/avatar.svg';
  fotoUsuario: string = this.avatarPadrao;

  totalEntradas: number = 0;
  exibirSaldo: boolean = false;

  dataAncorada: Date = new Date();
  textoMesAno: string = '';
  dataInicioMes: string = '';
  dataFimMes: string = '';
  statusMesTexto: string = '';

  dadosMeses: any[] = [];
  
  // Guarda a inscrição em tempo real unificada do banco
  private dadosSubscription!: Subscription;

  constructor() {
    addIcons({ 
      settings,
      settingsOutline, 
      eyeOutline,     
      eyeOffOutline, 
      chevronBackOutline, 
      chevronForwardOutline, 
      walletOutline, 
      homeOutline, 
      trendingUp, 
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
    this.inicializarSeletorData(); 
    const firebaseUser = this.authService.obterAuth?.currentUser;
    this.configurarUsuario(firebaseUser);
    this.escutarDadosFirebase(); 
  }

  ngOnDestroy() {
    // Evita vazamento de memória liberando a escuta ativa do Firestore
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

  // 🔄 REAL-TIME RELATÓRIOS: Escuta contas e entradas e monta o gráfico dinamicamente
  escutarDadosFirebase() {
    if (this.dadosSubscription) {
      this.dadosSubscription.unsubscribe();
    }

    const contasRef = collection(this.firestore, 'contas');
    const qContas = query(contasRef, where('usuario', '==', this.nomeUsuario));

    const entradasRef = collection(this.firestore, 'entradas');
    const qEntradas = query(entradasRef, where('usuario', '==', this.nomeUsuario));

    this.dadosSubscription = combineLatest([
      collectionData(qContas, { idField: 'id' }),
      collectionData(qEntradas, { idField: 'id' })
    ]).subscribe(([todasContas, todasEntradas]) => {
      
      // 1. Calcula o Saldo Geral (Entradas - Contas Pagas)
      const somaEntradas = todasEntradas.reduce((acc, entrada) => acc + (entrada['valor'] || 0), 0);
      const gastosPagos = todasContas.filter((conta: any) => conta.status === 'pago');
      const somaGastosPagos = gastosPagos.reduce((acc, conta) => acc + (conta['valor'] || 0), 0);
      
      this.totalEntradas = somaEntradas - somaGastosPagos;

      // 2. Processa e Agrupa as Contas para renderizar as barras do gráfico
      this.processarGraficoDeMeses(todasContas);
    });
  }

  processarGraficoDeMeses(todasContas: any[]) {
    const nomesMeses = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    const cores = ['#E9C7FF', '#CE8BFF', '#B550FF', '#9E24FF'];
    const anoSelecionado = this.dataAncorada.getFullYear();
    const resultadoAgrupado = [];

    for (let i = 0; i < 12; i++) {
      const contasDoMes = todasContas.filter((conta: any) => {
        if (!conta.vencimento) return false;
        
        const partes = conta.vencimento.split('-'); 
        const anoConta = parseInt(partes[0], 10);
        const mesConta = parseInt(partes[1], 10);
        
        return anoConta === anoSelecionado && mesConta === (i + 1);
      });

      const totalGastoNoMes = contasDoMes.reduce((soma: number, conta: any) => soma + (conta.valor || 0), 0);

      resultadoAgrupado.push({
        mes: nomesMeses[i],
        gastos: totalGastoNoMes,
        corFundo: cores[i % cores.length] 
      });
    }
    
    this.dadosMeses = resultadoAgrupado;
  }

  inicializarSeletorData() {
    const meses = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    const hoje = new Date();
    const ano = this.dataAncorada.getFullYear();
    const mesIndex = this.dataAncorada.getMonth();

    this.textoMesAno = `${meses[mesIndex]} de ${ano}`;
    const mesFormatado = String(mesIndex + 1).padStart(2, '0');
    this.dataInicioMes = `01/${mesFormatado}/${ano}`;

    const ultimoDia = new Date(ano, mesIndex + 1, 0).getDate();
    this.dataFimMes = `${String(ultimoDia).padStart(2, '0')}/${mesFormatado}/${ano}`;

    this.statusMesTexto = (ano === hoje.getFullYear() && mesIndex === hoje.getMonth()) ? 'Mês Atual' : '';
  }

  mudarMes(direcao: number) {
    this.dataAncorada.setMonth(this.dataAncorada.getMonth() + direcao);
    this.inicializarSeletorData();
    // Como estamos escutando o Firebase de forma contínua, basta forçar o reprocessamento
    // usando os dados que já estão guardados na nossa subscrição ativa se mudarmos o ano.
    this.escutarDadosFirebase();
  }

  temContasNoAno(): boolean {
    if (!this.dadosMeses) return false;
    return this.dadosMeses.some(item => item.gastos > 0);
  }

  alternarVisibilidadeSaldo() {
    this.exibirSaldo = !this.exibirSaldo;
  }

  calcularAlturaBarra(gasto: number): number {
    const todosGastos = this.dadosMeses.map(m => m.gastos);
    const maiorGasto = Math.max(...todosGastos);
    if (maiorGasto === 0) return 0;
    
    const alturaMaximaPx = 140; 
    return (gasto / maiorGasto) * alturaMaximaPx;
  }

  async dispararSeletorArquivo() {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Foto de Perfil',
      buttons: [
        {
          text: 'Escolher Nova Foto',
          icon: 'image-outline',
          handler: () => {
            const elementoInput = document.getElementById('seletorArquivoGrafico') as HTMLInputElement;
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