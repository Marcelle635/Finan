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
import { Conta } from '../models/conta.model';
import { addIcons } from 'ionicons';
import { 
  settings, 
  settingsOutline, 
  eyeOutline,       // Adicionado para o estado visível do saldo
  eyeOffOutline, 
  chevronBackOutline, 
  chevronForwardOutline, 
  add, 
  walletOutline, 
  homeOutline, 
  trendingUpOutline, 
  heartOutline 
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
export class CasaPage implements OnInit {
  nomeUsuario: string = '';
  fotoUsuario: string = localStorage.getItem('foto_usuario') || 'https://ionicframework.com/docs/img/demos/avatar.svg';
  
  contas: any[] = []; // Alterado para mapear dados dinâmicos com a tag usuario
  contasFiltradas: any[] = [];
  filtroAtivo: 'pago' | 'pendente' | 'vencido' = 'pendente';
  totalGastos: number = 0;
  
  // MODIFICAÇÕES: Variáveis para controle do Saldo Geral extraído das Entradas
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

  constructor(private contasService: ContasService) {
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
      heartOutline 
    });
  }

  ngOnInit() {
    this.inicializarSeletorData();
    this.carregarDados();
  }

  ionViewWillEnter() {
    this.carregarDados();
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
    this.carregarDados(); 
  }

  carregarDados() {
    this.nomeUsuario = this.contasService.buscarUsuario();
    
    // 1. MODIFICAÇÃO: Carrega e calcula o Saldo Geral vindo exclusivamente das entradas deste usuário
    this.carregarSaldoDasEntradas();

    // 2. MODIFICAÇÃO: Busca os Gastos do LocalStorage Geral filtrando pelo usuário ativo
    const todasContasGeral = JSON.parse(localStorage.getItem('app_todas_contas') || '[]');
    this.contas = todasContasGeral.filter((conta: any) => conta.usuario === this.nomeUsuario);
    
    this.atualizarStatusPorData();
    this.calcularTotal();
    this.filtrar(this.filtroAtivo);
  }

  /**
   * Busca os registros na chave das entradas e filtra pelo usuário logado para obter o valor somado
   */
  carregarSaldoDasEntradas() {
    const todasEntradas = JSON.parse(localStorage.getItem('app_todas_entradas') || '[]');
    const entradasDoUsuario = todasEntradas.filter((entrada: any) => entrada.usuario === this.nomeUsuario);
    this.totalEntradas = entradasDoUsuario.reduce((acc: number, entrada: any) => acc + entrada.valor, 0);
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

  adicionarGasto() {
    if (!this.novaConta.titulo || !this.novaConta.valor || !this.novaConta.vencimento) {
      alert('Por favor, preencha todos os campos!');
      return;
    }

    // MODIFICAÇÃO: Vincula o novo gasto ao usuário atual da conta
    const nova = {
      id: Date.now(),
      usuario: this.nomeUsuario, 
      titulo: this.novaConta.titulo,
      valor: Number(this.novaConta.valor),
      vencimento: this.novaConta.vencimento, 
      status: 'pendente' 
    };

    const todasContasGeral = JSON.parse(localStorage.getItem('app_todas_contas') || '[]');
    todasContasGeral.push(nova);
    
    // Salva na lista centralizada do dispositivo
    localStorage.setItem('app_todas_contas', JSON.stringify(todasContasGeral));
    
    this.carregarDados();
    this.abrirModal(false);
  }

  marcarComoPago(id: number) {
    const todasContasGeral = JSON.parse(localStorage.getItem('app_todas_contas') || '[]');
    const index = todasContasGeral.findIndex((c: any) => c.id === id);
    
    if (index !== -1) {
      todasContasGeral[index].status = 'pago';
      localStorage.setItem('app_todas_contas', JSON.stringify(todasContasGeral));
      this.carregarDados();
    }
  }

  excluirConta(id: number) {
    let todasContasGeral = JSON.parse(localStorage.getItem('app_todas_contas') || '[]');
    todasContasGeral = todasContasGeral.filter((c: any) => c.id !== id);
    
    localStorage.setItem('app_todas_contas', JSON.stringify(todasContasGeral));
    this.carregarDados();
  }

  dispararSeletorArquivo() {
    const elementoInput = document.getElementById('seletorArquivo') as HTMLInputElement;
    if (elementoInput) {
      elementoInput.click();
    }
  }

  aoSelecionarFoto(event: any) {
    const arquivo = event.target.files[0];
    if (arquivo) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.fotoUsuario = e.target.result;
        localStorage.setItem('foto_usuario', this.fotoUsuario);
      };
      reader.readAsDataURL(arquivo);
    }
  }
}