import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular'; // ESSENCIAL
import { ContasService } from '../services/contas.service';
import { Conta } from '../models/conta.model';

@Component({
  selector: 'app-casa',
  templateUrl: './casa.page.html',
  styleUrls: ['./casa.page.scss'],
  standalone: true, // Isso substitui a necessidade do .module.ts
  imports: [IonicModule, CommonModule, FormsModule] // IMPORTANTE: IonicModule precisa estar aqui
})
export class CasaPage implements OnInit {
  nomeUsuario: string = '';
  contas: Conta[] = [];
  contasFiltradas: Conta[] = [];
  filtroAtivo: 'pago' | 'pendente' | 'vencido' = 'pendente';
  totalGastos: number = 0;

  constructor(private contasService: ContasService) {}

  ngOnInit() {
    this.carregarDados();
  }

  ionViewWillEnter() {
    this.carregarDados();
  }

  carregarDados() {
    this.nomeUsuario = this.contasService.buscarUsuario();
    this.contas = this.contasService.buscarContas();
    this.calcularTotal();
    this.filtrar(this.filtroAtivo);
  }

  filtrar(status: 'pago' | 'pendente' | 'vencido') {
    this.filtroAtivo = status;
    this.contasFiltradas = this.contas.filter(c => c.status === status);
  }

  calcularTotal() {
    this.totalGastos = this.contas.reduce((acc, conta) => acc + conta.valor, 0);
  }

  marcarComoPago(id: number) {
    const index = this.contas.findIndex(c => c.id === id);
    if (index !== -1) {
      this.contas[index].status = 'pago';
      this.contasService.salvarContas(this.contas);
      this.carregarDados();
    }
  }
}