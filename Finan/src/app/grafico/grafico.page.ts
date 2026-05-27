import { Component, OnInit } from '@angular/core';
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
  IonTabButton 
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
  walletOutline, 
  homeOutline, 
  trendingUp, 
  heartOutline
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
export class GraficoPage implements OnInit {
  nomeUsuario: string = '';
  fotoUsuario: string = '';

  totalEntradas: number = 0;
  exibirSaldo: boolean = false;

  // ADICIONADO: Variáveis dinâmicas para as datas
  dataAncorada: Date = new Date();
  textoMesAno: string = '';
  dataInicioMes: string = '';
  dataFimMes: string = '';
  statusMesTexto: string = '';

  dadosMeses = [
    { mes: 'Janeiro', gastos: 1002.34, corFundo: '#E9C7FF' }, 
    { mes: 'Fevereiro', gastos: 2300.54, corFundo: '#CE8BFF' },
    { mes: 'Março', gastos: 3500.50, corFundo: '#B550FF' },   
    { mes: 'Abril', gastos: 2500.50, corFundo: '#CE8BFF' }
  ];

  constructor(private contasService: ContasService) {
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
      heartOutline
    });
  }

  ngOnInit() {
    this.inicializarSeletorData(); // ADICIONADO
    this.carregarDados();
  }

  ionViewWillEnter() {
    this.inicializarSeletorData(); // ADICIONADO para garantir que atualize ao entrar na tela
    this.carregarDados();
  }

  carregarDados() {
    this.nomeUsuario = this.contasService.buscarUsuario();
    this.fotoUsuario = localStorage.getItem('foto_usuario') || 'https://ionicframework.com/docs/img/demos/avatar.svg';
    this.calcularTotalEntradasDoUsuario();
  }

  // ADICIONADO: Função para gerar o dia atual e o fim do mês dinamicamente
  inicializarSeletorData() {
    const meses = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    
    const hoje = new Date();
    const ano = this.dataAncorada.getFullYear();
    const mesIndex = this.dataAncorada.getMonth();

    this.textoMesAno = `${meses[mesIndex]} de ${ano}`;
    
    // Formata o mês com 2 dígitos (ex: 05)
    const mesFormatado = String(mesIndex + 1).padStart(2, '0');
    
    // MODIFICAÇÃO: Pega o DIA ATUAL se for o mês corrente, senão assume dia '01'
    if (ano === hoje.getFullYear() && mesIndex === hoje.getMonth()) {
      const diaAtualFormatado = String(hoje.getDate()).padStart(2, '0');
      this.dataInicioMes = `${diaAtualFormatado}/${mesFormatado}/${ano}`;
      this.statusMesTexto = 'Mês Atual';
    } else {
      this.dataInicioMes = `01/${mesFormatado}/${ano}`;
      this.statusMesTexto = '';
    }

    // Calcula o último dia do mês selecionado
    const ultimoDia = new Date(ano, mesIndex + 1, 0).getDate();
    this.dataFimMes = `${String(ultimoDia).padStart(2, '0')}/${mesFormatado}/${ano}`;
  }

  // ADICIONADO: Atualiza as datas quando o usuário muda o ano/mês nas setas
  mudarAno(direcao: number) {
    this.dataAncorada.setFullYear(this.dataAncorada.getFullYear() + direcao);
    this.inicializarSeletorData();
  }

  calcularTotalEntradasDoUsuario() {
    const todasEntradas = JSON.parse(localStorage.getItem('app_todas_entradas') || '[]');
    const entradasDoUsuario = todasEntradas.filter((entrada: any) => entrada.usuario === this.nomeUsuario);
    this.totalEntradas = entradasDoUsuario.reduce((acc: number, entrada: any) => acc + entrada.valor, 0);
  }

  alternarVisibilidadeSaldo() {
    this.exibirSaldo = !this.exibirSaldo;
  }

  calcularAlturaBarra(gasto: number): number {
    const maiorGasto = Math.max(...this.dadosMeses.map(m => m.gastos));
    const alturaMaximaPx = 140; 
    return (gasto / maiorGasto) * alturaMaximaPx;
  }
}