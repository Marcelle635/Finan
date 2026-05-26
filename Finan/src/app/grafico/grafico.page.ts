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
  settingsOutline, 
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
  fotoUsuario: string = localStorage.getItem('foto_usuario') || 'https://ionicframework.com/docs/img/demos/avatar.svg';

  // Dados estruturados conforme os valores reais exibidos na imagem gr.PNG
  dadosMeses = [
    { mes: 'Janeiro', gastos: 1002.34, corFundo: '#E9C7FF' }, // Lilás bem claro
    { mes: 'Fevereiro', gastos: 2300.54, corFundo: '#CE8BFF' },
    { mes: 'Março', gastos: 3500.50, corFundo: '#B550FF' },   // Roxo mais escuro (Pico)
    { mes: 'Abril', gastos: 2500.50, corFundo: '#CE8BFF' }
  ];

  constructor(private contasService: ContasService) {
    addIcons({ 
      settingsOutline, 
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
    this.nomeUsuario = this.contasService.buscarUsuario();
  }

  mudarAno(direcao: number) {
    // Função para navegação do cabeçalho de datas
  }

  // Define dinamicamente a altura máxima proporcional para o gráfico de barras (máximo de 140px de altura)
  calcularAlturaBarra(gasto: number): number {
    const maiorGasto = Math.max(...this.dadosMeses.map(m => m.gastos));
    const alturaMaximaPx = 140; 
    return (gasto / maiorGasto) * alturaMaximaPx;
  }
}