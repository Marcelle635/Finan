import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { 
  IonContent, 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonButtons, 
  IonBackButton, 
  IonList, 
  IonItem, 
  IonIcon, 
  IonLabel 
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { chatbubble } from 'ionicons/icons';
import { ContasService } from '../services/contas.service';

interface Notificacao {
  titulo: string;
  mensagem: string;
}

@Component({
  selector: 'app-notificacoes',
  templateUrl: './notificacoes.page.html',
  styleUrls: ['./notificacoes.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonBackButton,
    IonList,
    IonItem,
    IonIcon,
    IonLabel
  ]
})
export class NotificacoesPage implements OnInit {
  nomeUsuario: string = '';
  notificacoes: Notificacao[] = [];

  constructor(private contasService: ContasService) {
    addIcons({ chatbubble });
  }

  ngOnInit() {
    this.gerarNotificacoes();
  }

  ionViewWillEnter() {
    this.gerarNotificacoes();
  }

  gerarNotificacoes() {
    this.nomeUsuario = this.contasService.buscarUsuario();
    this.notificacoes = [];

    // Busca todas as contas salvas no dispositivo
    const todasContasGeral = JSON.parse(localStorage.getItem('app_todas_contas') || '[]');
    
    // Filtra apenas as contas pendentes/vencidas do usuário ativo
    const contasDoUsuario = todasContasGeral.filter(
      (conta: any) => conta.usuario === this.nomeUsuario && conta.status !== 'pago'
    );

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    contasDoUsuario.forEach((conta: any) => {
      // Conversão da data 'AAAA-MM-DD' vinda do input
      const [ano, mes, dia] = conta.vencimento.split('-');
      const dataVencimento = new Date(Number(ano), Number(mes) - 1, Number(dia));
      dataVencimento.setHours(0, 0, 0, 0);

      // Calcula a diferença em milissegundos e converte para dias
      const diferencaTempo = dataVencimento.getTime() - hoje.getTime();
      const diferencaDias = Math.ceil(diferencaTempo / (1000 * 60 * 60 * 24));

      // Regra: 1 dia antes (amanhã) ou 3 dias antes
      if (diferencaDias === 1) {
        this.notificacoes.push({
          titulo: 'Vencimento',
          mensagem: `Sua conta do(a) ${conta.titulo} irá vencer amanhã`
        });
      } else if (diferencaDias === 3) {
        this.notificacoes.push({
          titulo: 'Vencimento',
          mensagem: `Sua conta do(a) ${conta.titulo} irá vencer em 3 dias`
        });
      }
    });
  }
}