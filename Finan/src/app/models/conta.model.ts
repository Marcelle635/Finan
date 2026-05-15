export interface Conta {
  id: number;
  titulo: string;
  vencimento: string;
  valor: number;
  status: 'pago' | 'pendente' | 'vencido';
}