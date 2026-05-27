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

  // Variáveis para controlo do seletor de datas e do ano ativo
  dataAncorada: Date = new Date();
  textoMesAno: string = '';
  dataInicioMes: string = '';
  dataFimMes: string = '';
  statusMesTexto: string = '';

  // Estrutura dinâmica que vai armazenar os 12 meses recalculados
  dadosMeses: any[] = [];

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
    this.inicializarSeletorData();
    this.carregarDados();
  }

  ionViewWillEnter() {
    this.inicializarSeletorData(); 
    this.carregarDados(); // Garante que os dados atualizam sempre que voltas a esta aba
  }

  carregarDados() {
    this.nomeUsuario = this.contasService.buscarUsuario();
    this.fotoUsuario = localStorage.getItem('foto_usuario') || 'https://ionicframework.com/docs/img/demos/avatar.svg';
    
    this.calcularTotalEntradasDoUsuario();
    this.calcularGastosPorMes(); // Calcula os valores reais de cada conta guardada
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
    
    if (ano === hoje.getFullYear() && mesIndex === hoje.getMonth()) {
      const diaAtualFormatado = String(hoje.getDate()).padStart(2, '0');
      this.dataInicioMes = `${diaAtualFormatado}/${mesFormatado}/${ano}`;
      this.statusMesTexto = 'Mês Atual';
    } else {
      this.dataInicioMes = `01/${mesFormatado}/${ano}`;
      this.statusMesTexto = '';
    }

    const ultimoDia = new Date(ano, mesIndex + 1, 0).getDate();
    this.dataFimMes = `${String(ultimoDia).padStart(2, '0')}/${mesFormatado}/${ano}`;
  }

  mudarAno(direcao: number) {
    // Altera o ano ao clicar nas setas laterais e recalcula o gráfico para o novo ano
    this.dataAncorada.setFullYear(this.dataAncorada.getFullYear() + direcao);
    this.inicializarSeletorData();
    this.calcularGastosPorMes();
  }

  /**
   * MÉTODOS DE FILTRO DINÂMICO DE ACORDO COM CADA CONTA
   */
  calcularGastosPorMes() {
    const nomesMeses = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    
    // Cores em tons de roxo/lilás para as colunas do gráfico
    const cores = ['#E9C7FF', '#CE8BFF', '#B550FF', '#9E24FF'];

    // Obtém a lista completa e atualizada de contas criadas na página "Casa"
    const todasContasGeral = JSON.parse(localStorage.getItem('app_todas_contas') || '[]');
    const anoSelecionado = this.dataAncorada.getFullYear();

    const resultadoAgrupado = [];

    // Percorre os 12 meses do ano para mapear os gastos de cada um
    for (let i = 0; i < 12; i++) {
      const contasDoMes = todasContasGeral.filter((conta: any) => {
        // 1. Verifica se a conta pertence ao utilizador logado
        if (conta.usuario !== this.nomeUsuario) return false;
        
        // 2. Extrai o Ano e o Mês da data de vencimento (Formato original: YYYY-MM-DD)
        const [anoStr, mesStr] = conta.vencimento.split('-');
        const mesmoAnoEMes = Number(anoStr) === anoSelecionado && Number(mesStr) === (i + 1);
        
        return mesmoAnoEMes;

        /* 💡 DICA DE SUPORTE: 
          Se quiseres que o gráfico mostre APENAS as contas que já foram pagas 
          (ignorando as pendentes até que o utilizador as pague), substitui o "return" acima por:
          
          return mesmoAnoEMes && conta.status === 'pago';
        */
      });

      // Soma o valor total líquido de todas as contas válidas encontradas para este mês
      const totalGastoNoMes = contasDoMes.reduce((soma: number, conta: any) => soma + conta.valor, 0);

      // Adiciona o mês estruturado ao array do gráfico
      resultadoAgrupado.push({
        mes: nomesMeses[i],
        gastos: totalGastoNoMes,
        corFundo: cores[i % cores.length] // Distribui as cores ciclicamente
      });
    }

    this.dadosMeses = resultadoAgrupado;
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
    const todosGastos = this.dadosMeses.map(m => m.gastos);
    const maiorGasto = Math.max(...todosGastos);
    
    // Evita divisões por zero se não houver gastos registados no ano inteiro
    if (maiorGasto === 0) return 0;
    
    const alturaMaximaPx = 140; // Limite visual da altura das barras em píxeis
    return (gasto / maiorGasto) * alturaMaximaPx;
  }
}