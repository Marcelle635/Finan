import { Component, OnInit, OnDestroy, inject } from '@angular/core';
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

// Importações do Firebase Firestore e RxJS
import { Firestore, collection, collectionData, query, where } from '@angular/fire/firestore';
import { AuthService } from '../services/auth';
import { ContasService } from '../services/contas.service';
import { Subscription } from 'rxjs';

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
export class NotificacoesPage implements OnInit, OnDestroy {
  private firestore = inject(Firestore);
  private authService = inject(AuthService);
  private contasService = inject(ContasService);

  nomeUsuario: string = '';
  notificacoes: Notificacao[] = [];
  
  // Inscrição para escutar as atualizações das contas
  private contasSubscription!: Subscription;

  constructor() {
    addIcons({ chatbubble });
  }

  ngOnInit() {
    // Monitoramento do estado do usuário para carregar os dados
    if (this.authService.obterAuth) {
      this.authService.obterAuth.onAuthStateChanged((firebaseUser) => {
        this.configurarUsuario(firebaseUser);
        this.escutarContasFirebase();
      });
    } else {
      this.configurarUsuario(null);
      this.escutarContasFirebase();
    }
  }

  ionViewWillEnter() {
    const firebaseUser = this.authService.obterAuth?.currentUser;
    this.configurarUsuario(firebaseUser);
    this.escutarContasFirebase();
  }

  ngOnDestroy() {
    // Evita vazamentos de memória limpando a escuta do banco ao sair
    if (this.contasSubscription) {
      this.contasSubscription.unsubscribe();
    }
  }

  configurarUsuario(firebaseUser: any | null) {
    const nomeLocal = this.contasService.buscarUsuario();
    
    if (firebaseUser && firebaseUser.displayName) {
      this.nomeUsuario = firebaseUser.displayName;
    } else if (nomeLocal && !nomeLocal.includes('@')) {
      this.nomeUsuario = nomeLocal;
    } else if (firebaseUser && firebaseUser.email) {
      this.nomeUsuario = firebaseUser.email.split('@')[0];
    } else {
      this.nomeUsuario = 'Usuário';
    }
  }

  // 🔄 REAL-TIME NOTIFICAÇÕES: Escuta o Firestore e reconstrói os alertas se alguma conta mudar
  escutarContasFirebase() {
    if (this.contasSubscription) {
      this.contasSubscription.unsubscribe();
    }

    const contasRef = collection(this.firestore, 'contas');
    // Busca apenas as contas pertencentes ao usuário ativo
    const q = query(contasRef, where('usuario', '==', this.nomeUsuario));

    this.contasSubscription = collectionData(q, { idField: 'id' }).subscribe((todasContas: any[]) => {
      // Filtra apenas as que não estão pagas para calcular o vencimento
      const contasPendentes = todasContas.filter(conta => conta.status !== 'pago');
      this.processarAlertasVencimento(contasPendentes);
    });
  }

  processarAlertasVencimento(contas: any[]) {
    this.notificacoes = [];
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    contas.forEach((conta: any) => {
      if (!conta.vencimento) return;

      // Conversão segura do formato 'AAAA-MM-DD' vindo do Firestore
      const partes = conta.vencimento.split('-');
      const ano = parseInt(partes[0], 10);
      const mes = parseInt(partes[1], 10);
      const dia = parseInt(partes[2], 10);

      const dataVencimento = new Date(ano, mes - 1, dia);
      dataVencimento.setHours(0, 0, 0, 0);

      // Calcula a diferença em dias corridos
      const diferencaTempo = dataVencimento.getTime() - hoje.getTime();
      const diferencaDias = Math.ceil(diferencaTempo / (1000 * 60 * 60 * 24));

      // Aplica as regras de negócio para as notificações
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