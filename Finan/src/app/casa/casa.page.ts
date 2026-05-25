import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonContent, IonHeader, IonItem, IonLabel, IonIcon, IonAvatar, 
  IonFabButton, IonCard, IonCardContent, IonFooter, IonTabBar, IonTabButton,
  IonModal // 👈 Adicionado aqui
} from '@ionic/angular/standalone'; 
import { ContasService } from '../services/contas.service';
import { Conta } from '../models/conta.model';
import { addIcons } from 'ionicons';
import { 
  settingsOutline, eyeOffOutline, chevronBackOutline, chevronForwardOutline, 
  add, walletOutline, homeOutline, trendingUpOutline, heartOutline 
} from 'ionicons/icons';

@Component({
  selector: 'app-casa',
  templateUrl: './casa.page.html',
  styleUrls: ['./casa.page.scss'],
  standalone: true, 
  imports: [
    CommonModule, FormsModule, IonContent, IonHeader, IonItem, IonLabel, 
    IonIcon, IonAvatar, IonFabButton, IonCard, IonCardContent, IonFooter, 
    IonTabBar, IonTabButton, IonModal // 👈 Adicionado aqui
  ]
})
export class CasaPage implements OnInit {
  nomeUsuario: string = '';
  contas: Conta[] = [];
  contasFiltradas: Conta[] = [];
  filtroAtivo: 'pago' | 'pendente' | 'vencido' = 'pendente';
  totalGastos: number = 0;

  // Variáveis para gerenciar o Modal e o Novo Formulário
  isModalAberto = false;
  novaConta = {
    titulo: '',
    valor: null as number | null,
    vencimento: ''
  };

  constructor(private contasService: ContasService) {
    addIcons({ 
      settingsOutline, eyeOffOutline, chevronBackOutline, 
      chevronForwardOutline, add, walletOutline, homeOutline, 
      trendingUpOutline, heartOutline 
    });
  }

  ngOnInit() {
    this.carregarDados();
  }

  ionViewWillEnter() {
    this.carregarDados();
  }

  carregarDados() {
    this.nomeUsuario = this.contasService.buscarUsuario();
    this.contas = this.contasService.buscarContas();
    
    // Atualiza automaticamente as contas criadas comparando a data com o dia de hoje
    this.atualizarStatusPorData();

    this.calcularTotal();
    this.filtrar(this.filtroAtivo);
  }

  // Compara as datas para ver se o card vai pro 'pendente' ou 'vencido'
  atualizarStatusPorData() {
    const hoje = new Date();
    hoje.setHours(0,0,0,0);

    this.contas.forEach(conta => {
      if (conta.status !== 'pago') {
        // Converte string 'AAAA-MM-DD' para objeto Date correto
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
      // Limpa os campos quando fecha
      this.novaConta = { titulo: '', valor: null, vencimento: '' };
    }
  }

  adicionarGasto() {
    if (!this.novaConta.titulo || !this.novaConta.valor || !this.novaConta.vencimento) {
      alert('Preencha todos os campos!');
      return;
    }

    // Criar o objeto estruturado com id único baseado em milisegundos
    const nova: Conta = {
      id: Date.now(),
      titulo: this.novaConta.titulo,
      valor: Number(this.novaConta.valor),
      vencimento: this.novaConta.vencimento, 
      status: 'pendente' // Começa pendente, o validador ajustará se já nasceu antigo
    };

    this.contas.push(nova);
    this.contasService.salvarContas(this.contas);
    this.carregarDados();
    this.abrirModal(false);
  }

  marcarComoPago(id: number) {
    const index = this.contas.findIndex(c => c.id === id);
    if (index !== -1) {
      this.contas[index].status = 'pago';
      this.contasService.salvarContas(this.contas);
      this.carregarDados();
    }
  }

  // 👇 Função do Botão Limpar (Deleta o registro)
  excluirConta(id: number) {
    this.contas = this.contas.filter(c => c.id !== id);
    this.contasService.salvarContas(this.contas);
    this.carregarDados();
  }
}