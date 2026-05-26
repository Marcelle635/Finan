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
  settingsOutline, 
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
  
  totalDesejado: number = 0;
  totalConquistado: number = 0;
  isModalAberto: boolean = false;

  // Dados mockados iniciais com base no desejosso.PNG
  desejosFiltrados: any[] = [
    { id: 1, titulo: 'Gloss Franciny', valor: 90.00, conquistado: false },
    { id: 2, titulo: 'Brincos', valor: 190.00, conquistado: true }
  ];

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
      settingsOutline, 
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
    this.calcularTotais();
  }

  ionViewWillEnter() {
    this.carregarDados();
  }

  carregarDados() {
    this.nomeUsuario = this.contasService.buscarUsuario();
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
      this.novoDesejo = { titulo: '', valor: null };
    }
  }

  calcularTotais() {
    // Total desejado = Soma de TODOS os itens do mês
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

    this.desejosFiltrados.push({
      id: Date.now(),
      titulo: this.novoDesejo.titulo,
      valor: Number(this.novoDesejo.valor),
      conquistado: false
    });

    this.calcularTotais();
    this.abrirModal(false);
  }

  alternarStatusDesejo(desejo: any) {
    // Inverte o estado de false para true (ou vice-versa) ao clicar no botão
    desejo.conquistado = !desejo.conquistado;
    this.calcularTotais();
  }

  excluirDesejo(id: number) {
    this.desejosFiltrados = this.desejosFiltrados.filter(d => d.id !== id);
    this.calcularTotais();
  }
}