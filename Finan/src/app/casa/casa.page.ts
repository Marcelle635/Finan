import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router'; // Importado para funcionar o routerLink no HTML

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
  settingsOutline, 
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
    RouterLink, // Adicionado no array de imports do Standalone Component
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
  // Dados do usuário e listas de contas
  nomeUsuario: string = '';
  
  // Tenta carregar a foto salva, se não existir, usa o avatar padrão cinza do Ionic
  fotoUsuario: string = localStorage.getItem('foto_usuario') || 'https://ionicframework.com/docs/img/demos/avatar.svg';
  
  contas: Conta[] = [];
  contasFiltradas: Conta[] = [];
  filtroAtivo: 'pago' | 'pendente' | 'vencido' = 'pendente';
  totalGastos: number = 0;

  // Gerenciamento do Modal de Cadastro
  isModalAberto = false;
  novaConta = {
    titulo: '',
    valor: null as number | null,
    vencimento: ''
  };

  // Variáveis do Seletor de Data Dinâmico
  dataAncorada: Date = new Date(); // Inicia com a data atual
  textoMesAno: string = '';
  dataInicioMes: string = '';
  dataFimMes: string = '';
  statusMesTexto: string = '';

  constructor(private contasService: ContasService) {
    // Registro dos ícones do Ionicons
    addIcons({ 
      settingsOutline, 
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

  /**
   * Inicializa o cabeçalho de períodos e calcula as datas de início e fim
   */
  inicializarSeletorData() {
    const meses = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];

    const ano = this.dataAncorada.getFullYear();
    const mesIndex = this.dataAncorada.getMonth();

    // Define o título principal (Ex: "Maio de 2026")
    this.textoMesAno = `${meses[mesIndex]} de ${ano}`;

    // Calcula o primeiro dia (sempre 01) com dois dígitos no mês
    const mesFormatado = String(mesIndex + 1).padStart(2, '0');
    this.dataInicioMes = `01/${mesFormatado}/${ano}`;

    // Calcula dinamicamente o último dia do mês atual
    const ultimoDia = new Date(ano, mesIndex + 1, 0).getDate();
    this.dataFimMes = `${String(ultimoDia).padStart(2, '0')}/${mesFormatado}/${ano}`;

    // Valida se o período visualizado corresponde ao mês corrente no relógio
    const hoje = new Date();
    if (ano === hoje.getFullYear() && mesIndex === hoje.getMonth()) {
      this.statusMesTexto = 'Mês Atual';
    } else {
      this.statusMesTexto = ''; 
    }
  }

  /**
   * Navega entre os meses pelas setas avançar/retroceder
   */
  mudarMes(direcao: number) {
    this.dataAncorada.setMonth(this.dataAncorada.getMonth() + direcao);
    this.inicializarSeletorData();
    this.carregarDados(); // Recarrega aplicando os filtros ao novo mês se necessário
  }

  /**
   * Carrega as informações e atualiza a interface
   */
  carregarDados() {
    this.nomeUsuario = this.contasService.buscarUsuario();
    this.contas = this.contasService.buscarContas();
    
    this.atualizarStatusPorData();
    this.calcularTotal();
    this.filtrar(this.filtroAtivo);
  }

  /**
   * Compara as datas das contas com o dia de hoje para atualizar pendências e vencimentos
   */
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

  /**
   * Filtra as contas visíveis nos cards
   */
  filtrar(status: 'pago' | 'pendente' | 'vencido') {
    this.filtroAtivo = status;
    this.contasFiltradas = this.contas.filter(c => c.status === status);
  }

  /**
   * Calcula o somatório total de gastos mapeados
   */
  calcularTotal() {
    this.totalGastos = this.contas.reduce((acc, conta) => acc + conta.valor, 0);
  }

  /**
   * Controla a abertura e fechamento do formulário Modal
   */
  abrirModal(abrir: boolean) {
    this.isModalAberto = abrir;
    if (!abrir) {
      this.novaConta = { titulo: '', valor: null, vencimento: '' };
    }
  }

  /**
   * Adiciona um novo item vindo do Modal
   */
  adicionarGasto() {
    if (!this.novaConta.titulo || !this.novaConta.valor || !this.novaConta.vencimento) {
      alert('Por favor, preencha todos os campos!');
      return;
    }

    const nova: Conta = {
      id: Date.now(),
      titulo: this.novaConta.titulo,
      valor: Number(this.novaConta.valor),
      vencimento: this.novaConta.vencimento, 
      status: 'pendente' 
    };

    this.contas.push(nova);
    this.contasService.salvarContas(this.contas);
    this.carregarDados();
    this.abrirModal(false);
  }

  /**
   * Altera o status da conta para pago
   */
  marcarComoPago(id: number) {
    const index = this.contas.findIndex(c => c.id === id);
    if (index !== -1) {
      this.contas[index].status = 'pago';
      this.contasService.salvarContas(this.contas);
      this.carregarDados();
    }
  }

  /**
   * Remove permanentemente a conta
   */
  excluirConta(id: number) {
    this.contas = this.contas.filter(c => c.id !== id);
    this.contasService.salvarContas(this.contas);
    this.carregarDados();
  }

  /**
   * Simula o clique no input do tipo file oculto quando o usuário clica no avatar
   */
  dispararSeletorArquivo() {
    const elementoInput = document.getElementById('seletorArquivo') as HTMLInputElement;
    if (elementoInput) {
      elementoInput.click();
    }
  }

  /**
   * Processa a foto selecionada e converte em Base64 para exibir na tela e salvar localmente
   */
  aoSelecionarFoto(event: any) {
    const arquivo = event.target.files[0];
    
    if (arquivo) {
      const reader = new FileReader();
      
      reader.onload = (e: any) => {
        this.fotoUsuario = e.target.result;
        // Salva a foto em formato string no armazenamento local do navegador
        localStorage.setItem('foto_usuario', this.fotoUsuario);
      };
      
      reader.readAsDataURL(arquivo);
    }
  }
}