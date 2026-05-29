import { Component, OnInit, inject } from '@angular/core'; 
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
export class DesejosPage implements OnInit {
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
    this.carregarDados();
  }

  ionViewWillEnter() {
    this.carregarDados();
  }

  carregarDados() {
    const usuarioLogadoApp = localStorage.getItem('usuario_logado');
    const nomeLocalService = this.contasService.buscarUsuario();
    const firebaseUser = this.authService.obterAuth.currentUser;
    
    if (usuarioLogadoApp && !usuarioLogadoApp.includes('@')) {
      this.nomeUsuario = usuarioLogadoApp;
    } else if (nomeLocalService && !nomeLocalService.includes('@')) {
      this.nomeUsuario = nomeLocalService;
    } else if (firebaseUser && firebaseUser.displayName) {
      this.nomeUsuario = firebaseUser.displayName;
    } else if (firebaseUser && firebaseUser.email) {
      this.nomeUsuario = firebaseUser.email.split('@')[0];
    } else {
      this.nomeUsuario = 'Usuário';
    }

    this.primeiroNome = this.nomeUsuario.trim().split(' ')[0];
    
    const chaveFotoUsuario = 'foto_' + this.nomeUsuario;
    this.fotoUsuario = localStorage.getItem(chaveFotoUsuario) || this.avatarPadrao;
    
    this.calcularTotalEntradasDoUsuario();
    this.carregarDesejosDoUsuario(); 
  }

  calcularTotalEntradasDoUsuario() {
    const todasEntradas = JSON.parse(localStorage.getItem('app_todas_entradas') || '[]');
    const entradasDoUsuario = todasEntradas.filter((entrada: any) => entrada.usuario === this.nomeUsuario);
    const somaEntradas = entradasDoUsuario.reduce((acc: number, entrada: any) => acc + entrada.valor, 0);

    const todasContasGeral = JSON.parse(localStorage.getItem('app_todas_contas') || '[]');
    const gastosPagosDoUsuario = todasContasGeral.filter((conta: any) => 
      conta.usuario === this.nomeUsuario && conta.status === 'pago'
    );
    const somaGastosPagos = gastosPagosDoUsuario.reduce((acc: number, conta: any) => acc + conta.valor, 0);

    this.totalEntradas = somaEntradas - somaGastosPagos;
  }

  alternarVisibilidadeSaldo() {
    this.exibirSaldo = !this.exibirSaldo;
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

  carregarDesejosDoUsuario() {
    const todosDesejosGeral = JSON.parse(localStorage.getItem('app_todas_contas_desejos') || '[]');
    this.desejosFiltrados = todosDesejosGeral.filter((desejo: any) => desejo.usuario === this.nomeUsuario);
    this.calcularTotais();
  }

  salvarDesejosNoStorage(listaLocalAtualizada: any[]) {
    const todosDesejosGeral = JSON.parse(localStorage.getItem('app_todas_contas_desejos') || '[]');
    const outrosUsuarios = todosDesejosGeral.filter((desejo: any) => desejo.usuario !== this.nomeUsuario);
    const bancoAtualizado = [...outrosUsuarios, ...listaLocalAtualizada];
    localStorage.setItem('app_todas_contas_desejos', JSON.stringify(bancoAtualizado));
  }

  calcularTotais() {
    this.totalDesejado = this.desejosFiltrados
      .filter(item => !item.conquistado)
      .reduce((acc, item) => acc + item.valor, 0);
    
    this.totalConquistado = this.desejosFiltrados
      .filter(item => item.conquistado)
      .reduce((acc, item) => acc + item.valor, 0);
  }

  adicionarDesejo() {
    if (!this.novoDesejo.titulo || !this.novoDesejo.valor) {
      alert('Preencha todos os campos!');
      return;
    }

    const novoItem = {
      id: Date.now(),
      usuario: this.nomeUsuario, 
      titulo: this.novoDesejo.titulo,
      valor: Number(this.novoDesejo.valor),
      conquistado: false
    };

    this.desejosFiltrados.push(novoItem);
    this.salvarDesejosNoStorage(this.desejosFiltrados);
    this.calcularTotais();
    this.abrirModal(false);
  }

  alternarStatusDesejo(desejo: any) {
    desejo.conquistado = !desejo.conquistado;
    this.salvarDesejosNoStorage(this.desejosFiltrados);
    this.calcularTotais();
  }

  excluirDesejo(id: number) {
    this.desejosFiltrados = this.desejosFiltrados.filter(d => d.id !== id);
    this.salvarDesejosNoStorage(this.desejosFiltrados);
    this.calcularTotais();
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