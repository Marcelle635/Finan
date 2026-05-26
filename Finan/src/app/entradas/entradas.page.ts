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
import { ContasService } from '../services/contas.service'; // 1. IMPORTAÇÃO DO SEU SERVIÇO
import { addIcons } from 'ionicons';
import { 
  settingsOutline, 
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
  // Variáveis dinâmicas do usuário
  nomeUsuario: string = '';
  fotoUsuario: string = localStorage.getItem('foto_usuario') || 'https://ionicframework.com/docs/img/demos/avatar.svg';
  
  totalEntradas: number = 5000.00;
  isModalAberto: boolean = false;

  entradasFiltradas: any[] = [
    { id: 1, titulo: 'Salário', categoria: 'Salário', valor: 1000.00 },
    { id: 2, titulo: 'Salário', categoria: 'Salário', valor: 4000.00 }
  ];

  novaEntrada = {
    titulo: '',
    valor: null as number | null,
    data: ''
  };

  dataAncorada: Date = new Date();
  textoMesAno: string = '';
  dataInicioMes: string = '';
  dataFimMes: string = '';
  statusMesTexto: string = '';

  // 2. INJEÇÃO DO SERVIÇO NO CONSTRUTOR
  constructor(private contasService: ContasService) {
    addIcons({ 
      settingsOutline, 
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
    this.carregarDados(); // Carrega ao iniciar
  }

  // Garante que atualiza o nome mesmo se trocar de usuário sem recarregar o app
  ionViewWillEnter() {
    this.carregarDados();
  }

  /**
   * 3. BUSCA OS DADOS DO USUÁRIO LOGADO DIRETAMENTE DO SERVIÇO
   */
  carregarDados() {
    this.nomeUsuario = this.contasService.buscarUsuario();
    // Atualiza a foto caso ela tenha sido alterada na página Home/Casa
    this.fotoUsuario = localStorage.getItem('foto_usuario') || 'https://ionicframework.com/docs/img/demos/avatar.svg';
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
      this.novaEntrada = { titulo: '', valor: null, data: '' };
    }
  }

  adicionarEntrada() {
    if (!this.novaEntrada.titulo || !this.novaEntrada.valor) {
      alert('Preencha os campos obrigatórios!');
      return;
    }
    
    this.entradasFiltradas.push({
      id: Date.now(),
      titulo: this.novaEntrada.titulo,
      categoria: 'Entrada',
      valor: Number(this.novaEntrada.valor)
    });

    this.totalEntradas += Number(this.novaEntrada.valor);
    this.abrirModal(false);
  }

  excluirEntrada(id: number) {
    const index = this.entradasFiltradas.findIndex(e => e.id === id);
    if (index !== -1) {
      this.totalEntradas -= this.entradasFiltradas[index].valor;
      this.entradasFiltradas = this.entradasFiltradas.filter(e => e.id !== id);
    }
  }
}