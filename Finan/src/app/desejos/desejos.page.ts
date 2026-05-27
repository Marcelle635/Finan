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
  giftOutline
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
  nomeUsuario: string = '';
  fotoUsuario: string = localStorage.getItem('foto_usuario') || 'https://ionicframework.com/docs/img/demos/avatar.svg';
  
  totalEntradas: number = 0;
  exibirSaldo: boolean = false;

  totalDesejado: number = 0;
  totalConquistado: number = 0;
  isModalAberto: boolean = false;

  // MODIFICADO: Começa como um array vazio para não trazer valores estáticos/mockados de teste
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
      heartOutline,
      heart,
      trashOutline,
      checkmarkCircleOutline,
      cartOutline,
      giftOutline
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
    
    this.calcularTotalEntradasDoUsuario();
    this.carregarDesejosDoUsuario(); // MODIFICADO: Carrega os desejos salvos reais do usuário
  }

  calcularTotalEntradasDoUsuario() {
    const todasEntradas = JSON.parse(localStorage.getItem('app_todas_entradas') || '[]');
    const entradasDoUsuario = todasEntradas.filter((entrada: any) => entrada.usuario === this.nomeUsuario);
    this.totalEntradas = entradasDoUsuario.reduce((acc: number, entrada: any) => acc + entrada.valor, 0);
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

  /**
   * NOVAS FUNÇÕES PARA SALVAR E FILTRAR DE ACORDO COM A CONTA DE CADA USUÁRIO
   */

  carregarDesejosDoUsuario() {
    // Busca a lista mestre global de desejos no dispositivo
    const todosDesejosGeral = JSON.parse(localStorage.getItem('app_todas_contas_desejos') || '[]');
    
    // Filtra para exibir apenas os desejos pertencentes à conta do usuário atual
    this.desejosFiltrados = todosDesejosGeral.filter((desejo: any) => desejo.usuario === this.nomeUsuario);
    
    this.calcularTotais();
  }

  salvarDesejosNoStorage(listaLocalAtualizada: any[]) {
    // Carrega tudo o que existe hoje no dispositivo
    const todosDesejosGeral = JSON.parse(localStorage.getItem('app_todas_contas_desejos') || '[]');
    
    // Remove os registros antigos desse usuário específico para não duplicar
    const outrosUsuarios = todosDesejosGeral.filter((desejo: any) => desejo.usuario !== this.nomeUsuario);
    
    // Junta os desejos atualizados do usuário com os desejos dos outros usuários logados no mesmo celular
    const bancoAtualizado = [...outrosUsuarios, ...listaLocalAtualizada];
    
    // Salva de volta no banco de dados local
    localStorage.setItem('app_todas_contas_desejos', JSON.stringify(bancoAtualizado));
  }

  calcularTotais() {
    // Total desejado = Soma de TODOS os itens do usuário
    this.totalDesejado = this.desejosFiltrados.reduce((acc, item) => acc + item.valor, 0);
    
    // Total conquistado = Soma apenas dos itens marcados como true (Conquistado)
    this.totalConquistado = this.desejosFiltrados
      .filter(item => item.conquistado)
      .reduce((acc, item) => acc + item.valor, 0);
  }

  adicionarDesejo() {
    if (!this.novoDesejo.titulo || !this.novoDesejo.valor) {
      alert('Preencha todos os campos!');
      return;
    }

    // Cria o objeto contendo o vínculo do usuário logado dono da conta
    const novoItem = {
      id: Date.now(),
      usuario: this.nomeUsuario, // Vínculo com a conta
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
}