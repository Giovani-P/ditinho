export type Perfil = 'VENDEDOR' | 'LOGISTICA' | 'FINANCEIRO' | 'ENTREGADOR' | 'ADMIN'
export type StatusPagamento = 'PAGO' | 'RECEBER_NA_ENTREGA'
export type TipoPedido = 'ENTREGA' | 'RETIRADA'
export type OrigemPedido = 'CISS_POWER' | 'MANUAL'
export type StatusPedido = 'NOVO' | 'EM_SEPARACAO' | 'AGUARDANDO_ENTREGA' | 'EM_ROTA' | 'ENTREGUE' | 'CANCELADO'
export type TipoVeiculo = 'MOTO' | 'CAMINHAO'
export type PrioridadeEspeto = 'HOJE' | 'AMANHA'
export type StatusEspeto = 'PENDENTE' | 'EM_ROTA' | 'ENTREGUE' | 'PROBLEMA'

export interface DashboardStats {
  pedidosHoje: number
  espetosHoje: number
  emRota: number
  entregues: number
  problemas: number
  pendentes: number
}

export interface PedidoComCliente {
  id: string
  numeroCiss: string | null
  valor: number
  itens: string
  statusPagamento: string
  tipo: string
  origem: string
  status: string
  createdAt: Date
  cliente: {
    id: string
    nome: string
    telefone: string | null
    endereco: string
    bairro: string
  }
}

export interface EspetoCompleto {
  id: string
  numero: number
  tipo: string
  prioridade: string
  status: string
  horarioEst: string | null
  itensRetirados: string | null
  observacoes: string | null
  createdAt: Date
  cliente: {
    nome: string
    telefone: string | null
    endereco: string
    bairro: string
  }
  entregador: {
    tipo: string
    user: { nome: string }
  } | null
}

// NextAuth type extension
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name: string
      email: string
      perfil: string
    }
  }
  interface User {
    perfil: string
  }
}

