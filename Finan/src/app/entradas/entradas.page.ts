import { Component, OnInit } from '@angular/core';
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
  ActionSheetController // Importado para gerenciar as opções da foto de perfil
} from '@ionic/angular/standalone'; 
import { ContasService } from '../services/contas.service';
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
  imageOutline,     // Ícone adicionado para o menu da foto
  closeOutline      // Ícone adicionado para o menu da foto
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
export class EntradasPage implements OnInit {
  nomeUsuario: string = '';
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

  constructor(
    private contasService: ContasService,
    private actionSheetCtrl: ActionSheetController // Injetando o controlador de menu
  ) {
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
    this.carregarDados(); 
  }

  ionViewWillEnter() {
    this.carregarDados();
  }

  carregarDados() {
    this.nomeUsuario = this.contasService.buscarUsuario();
    
    // Configura a foto dinamicamente com base no usuário atual logado
    const chaveFotoUsuario = 'foto_' + this.nomeUsuario;
    this.fotoUsuario = localStorage.getItem(chaveFotoUsuario) || this.avatarPadrao;
    
    this.carregarEntradasDoUsuario();
  }

  carregarEntradasDoUsuario() {
    const todasEntradas = JSON.parse(localStorage.getItem('app_todas_entradas') || '[]');
    this.entradasFiltradas = todasEntradas.filter((entrada: any) => entrada.usuario === this.nomeUsuario);
    this.calcularTotalEntradas();
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
      this.novaEntrada = { titulo: '', valor: null, categoria: 'Salário' };
    }
  }

  alternarVisibilidadeSaldo() {
    this.exibirSaldo = !this.exibirSaldo;
  }

  calcularTotalEntradas() {
    // 1. Calcula a soma de todas as entradas do usuário logado
    const somaEntradas = this.entradasFiltradas.reduce((acc, entrada) => acc + entrada.valor, 0);

    // 2. Busca e calcula os gastos desse usuário que possuem status igual a 'pago'
    const todasContasGeral = JSON.parse(localStorage.getItem('app_todas_contas') || '[]');
    const gastosPagosDoUsuario = todasContasGeral.filter((conta: any) => 
      conta.usuario === this.nomeUsuario && conta.status === 'pago'
    );
    const somaGastosPagos = gastosPagosDoUsuario.reduce((acc: number, conta: any) => acc + conta.valor, 0);

    // 3. O Saldo Geral desconta o que já foi pago
    this.totalEntradas = somaEntradas - somaGastosPagos;
  }

  adicionarEntrada() {
    if (!this.novaEntrada.titulo || !this.novaEntrada.valor) {
      alert('Preencha os campos obrigatórios!');
      return;
    }
    
    const novaObjetoEntrada = {
      id: Date.now(),
      usuario: this.nomeUsuario, 
      titulo: this.novaEntrada.titulo,
      categoria: this.novaEntrada.categoria,
      valor: Number(this.novaEntrada.valor)
    };

    const todasEntradas = JSON.parse(localStorage.getItem('app_todas_entradas') || '[]');
    todasEntradas.push(novaObjetoEntrada);
    
    localStorage.setItem('app_todas_entradas', JSON.stringify(todasEntradas));

    this.carregarEntradasDoUsuario();
    this.abrirModal(false);
  }

  excluirEntrada(id: number) {
    let todasEntradas = JSON.parse(localStorage.getItem('app_todas_entradas') || '[]');
    todasEntradas = todasEntradas.filter((e: any) => e.id !== id);
    localStorage.setItem('app_todas_entradas', JSON.stringify(todasEntradas));

    this.carregarEntradasDoUsuario();
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