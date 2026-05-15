import { Injectable } from '@angular/core';
import { Conta } from '../models/conta.model';

@Injectable({
  providedIn: 'root'
})
export class ContasService {
  private STORAGE_KEY = 'minhas_contas_financeiro';
  private USER_KEY = 'usuario_nome';

  constructor() { }

  // --- GESTÃO DAS CONTAS ---

  // Retorna todas as contas salvas
  buscarContas(): Conta[] {
    const dados = localStorage.getItem(this.STORAGE_KEY);
    return dados ? JSON.parse(dados) : [];
  }

  // Salva a lista inteira de contas
  salvarContas(contas: Conta[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(contas));
  }

  // Adiciona uma única conta nova e já salva
  adicionarConta(conta: Conta): void {
    const contas = this.buscarContas();
    contas.push(conta);
    this.salvarContas(contas);
  }

  // --- GESTÃO DO USUÁRIO ---

  // Salva o nome que o usuário digitou no cadastro
  salvarUsuario(nome: string): void {
    localStorage.setItem(this.USER_KEY, nome);
  }

  // Busca o nome para exibir no topo da tela (Ex: na Home)
  buscarUsuario(): string {
    return localStorage.getItem(this.USER_KEY) || 'Usuário'; 
  }
}