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
  IonModal 
} from '@ionic/angular/standalone'; 
import { ContasService } from '../services/contas.service';
import { addIcons } from 'ionicons';
import { 
  settings, 
  settingsOutline, 
  eyeOutline,      // Adicionado para quando o saldo aparecer
  eyeOffOutline, 
  chevronBackOutline, 
  chevronForwardOutline, 
  add, 
  walletOutline, 
  homeOutline, 
  trendingUpOutline, 
  heartOutline,
  trashOutline
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
  fotoUsuario: string = localStorage.getItem('foto_usuario') || 'https://ionicframework.com/docs/img/demos/avatar.svg';
  
  totalEntradas: number = 0; 
  isModalAberto: boolean = false;
  
  // MODIFICAÇÃO: Controla se o saldo geral está visível ou oculto com asteriscos
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

  constructor(private contasService: ContasService) {
    addIcons({ 
      settings,
      settingsOutline, 
      eyeOutline, // Registrando o ícone do olho aberto
      eyeOffOutline, 
      chevronBackOutline, 
      chevronForwardOutline, 
      add, 
      walletOutline, 
      homeOutline, 
      trendingUpOutline, 
      heartOutline,
      trashOutline
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
    this.fotoUsuario = localStorage.getItem('foto_usuario') || 'https://ionicframework.com/docs/img/demos/avatar.svg';
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

  /**
   * Alterna a visibilidade do Saldo Geral ao clicar na linha do saldo
   */
  alternarVisibilidadeSaldo() {
    this.exibirSaldo = !this.exibirSaldo;
  }

  calcularTotalEntradas() {
    this.totalEntradas = this.entradasFiltradas.reduce((acc, entrada) => acc + entrada.valor, 0);
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
}