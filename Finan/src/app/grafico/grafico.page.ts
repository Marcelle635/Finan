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
  IonTabButton,
  ActionSheetController // Importado para gerenciar as opções da foto de perfil
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
  heartOutline,
  trashOutline,     // Ícone adicionado para a opção de remover foto
  imageOutline,     // Ícone adicionado para a opção de escolher foto
  closeOutline      // Ícone adicionado para o botão cancelar do menu
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
  avatarPadrao: string = 'https://ionicframework.com/docs/img/demos/avatar.svg';
  fotoUsuario: string = this.avatarPadrao;

  totalEntradas: number = 0;
  exibirSaldo: boolean = false;

  dataAncorada: Date = new Date();
  textoMesAno: string = '';
  dataInicioMes: string = '';
  dataFimMes: string = '';
  statusMesTexto: string = '';

  dadosMeses: any[] = [];

  constructor(
    private contasService: ContasService,
    private actionSheetCtrl: ActionSheetController // Injetando o controlador de menu
  ) {
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
      heartOutline,
      trashOutline,
      imageOutline,
      closeOutline
    });
  }

  ngOnInit() {
    this.inicializarSeletorData();
    this.carregarDados();
  }

  ionViewWillEnter() {
    this.inicializarSeletorData(); 
    this.carregarDados(); 
  }

  carregarDados() {
    this.nomeUsuario = this.contasService.buscarUsuario();
    
    // Configura a foto dinamicamente com base no usuário atual logado
    const chaveFotoUsuario = 'foto_' + this.nomeUsuario;
    this.fotoUsuario = localStorage.getItem(chaveFotoUsuario) || this.avatarPadrao;
    
    // Sincroniza dados antigos para garantir que o gráfico não comece zerado
    this.sincronizarContasAntigas();
    
    this.calcularTotalEntradasDoUsuario();
    this.calcularGastosPorMes(); 
  }

  /**
   * FUNÇÃO DE SEGURANÇA: Se o histórico estiver vazio, ela copia os gastos existentes 
   * da página inicial para que o gráfico apareça preenchido imediatamente.
   */
  sincronizarContasAntigas() {
    const historicoDefinitivo = JSON.parse(localStorage.getItem('app_historico_gastos') || '[]');
    
    if (historicoDefinitivo.length === 0) {
      const todasContasGeral = JSON.parse(localStorage.getItem('app_todas_contas') || '[]');
      if (todasContasGeral.length > 0) {
        localStorage.setItem('app_historico_gastos', JSON.stringify(todasContasGeral));
      }
    }
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
    this.dataInicioMes = `01/${mesFormatado}/${ano}`;

    const ultimoDia = new Date(ano, mesIndex + 1, 0).getDate();
    this.dataFimMes = `${String(ultimoDia).padStart(2, '0')}/${mesFormatado}/${ano}`;

    this.statusMesTexto = (ano === hoje.getFullYear() && mesIndex === hoje.getMonth()) ? 'Mês Atual' : '';
  }

  mudarMes(direcao: number) {
    this.dataAncorada.setMonth(this.dataAncorada.getMonth() + direcao);
    this.inicializarSeletorData();
    this.calcularGastosPorMes();
  }

  calcularGastosPorMes() {
    const nomesMeses = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    
    const cores = ['#E9C7FF', '#CE8BFF', '#B550FF', '#9E24FF'];

    const historicoDefinitivo = JSON.parse(localStorage.getItem('app_historico_gastos') || '[]');
    const anoSelecionado = this.dataAncorada.getFullYear();

    const resultadoAgrupado = [];

    for (let i = 0; i < 12; i++) {
      const contasDoMes = historicoDefinitivo.filter((conta: any) => {
        if (conta.usuario !== this.nomeUsuario) return false;
        if (!conta.vencimento) return false;
        
        const partes = conta.vencimento.split('-'); // ["2026", "05", "28"]
        const anoConta = parseInt(partes[0], 10);
        const mesConta = parseInt(partes[1], 10);
        
        const mesmoAnoEMes = anoConta === anoSelecionado && mesConta === (i + 1);
        return mesmoAnoEMes;
      });

      const totalGastoNoMes = contasDoMes.reduce((soma: number, conta: any) => soma + conta.valor, 0);

      resultadoAgrupado.push({
        mes: nomesMeses[i],
        gastos: totalGastoNoMes,
        corFundo: cores[i % cores.length] 
      });
    }

    this.dadosMeses = resultadoAgrupado;
  }

  calcularTotalEntradasDoUsuario() {
    // 1. Calcula a soma de todas as entradas do usuário logado
    const todasEntradas = JSON.parse(localStorage.getItem('app_todas_entradas') || '[]');
    const entradasDoUsuario = todasEntradas.filter((entrada: any) => entrada.usuario === this.nomeUsuario);
    const somaEntradas = entradasDoUsuario.reduce((acc: number, entrada: any) => acc + entrada.valor, 0);

    // 2. Busca e calcula os gastos desse usuário que possuem status igual a 'pago'
    const todasContasGeral = JSON.parse(localStorage.getItem('app_todas_contas') || '[]');
    const gastosPagosDoUsuario = todasContasGeral.filter((conta: any) => 
      conta.usuario === this.nomeUsuario && conta.status === 'pago'
    );
    const somaGastosPagos = gastosPagosDoUsuario.reduce((acc: number, conta: any) => acc + conta.valor, 0);

    // 3. Aplica a dedução de gastos pagos ao Saldo Geral
    this.totalEntradas = somaEntradas - somaGastosPagos;
  }

  alternarVisibilidadeSaldo() {
    this.exibirSaldo = !this.exibirSaldo;
  }

  calcularAlturaBarra(gasto: number): number {
    const todosGastos = this.dadosMeses.map(m => m.gastos);
    const maiorGasto = Math.max(...todosGastos);
    
    if (maiorGasto === 0) return 0;
    
    const alturaMaximaPx = 140; 
    return (gasto / maiorGasto) * alturaMaximaPx;
  }

  // Abre as opções para alterar ou deixar sem foto
  async dispararSeletorArquivo() {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Foto de Perfil',
      buttons: [
        {
          text: 'Escolher Nova Foto',
          icon: 'image-outline',
          handler: () => {
            const elementoInput = document.getElementById('seletorArquivoGrafico') as HTMLInputElement;
            if (elementoInput) {
              elementoInput.click();
            }
          }
        },
        {
          text: 'Deixar Sem Foto',
          role: 'destructive',
          icon: 'trash-outline',
          handler: () => {
            this.removerFoto();
          }
        },
        {
          text: 'Cancelar',
          role: 'cancel',
          icon: 'close-outline'
        }
      ]
    });
    await actionSheet.present();
  }

  aoSelecionarFoto(event: any) {
    const arquivo = event.target.files[0];
    if (arquivo) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.fotoUsuario = e.target.result;
        
        const chaveFotoUsuario = 'foto_' + this.nomeUsuario;
        localStorage.setItem(chaveFotoUsuario, this.fotoUsuario);
      };
      reader.readAsDataURL(arquivo);
    }
  }

  removerFoto() {
    this.fotoUsuario = this.avatarPadrao;
    const chaveFotoUsuario = 'foto_' + this.nomeUsuario;
    localStorage.removeItem(chaveFotoUsuario);
  }
}