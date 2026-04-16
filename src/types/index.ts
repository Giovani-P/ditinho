export type Perfil = 'VENDEDOR' | 'LOGISTICA' | 'FINANCEIRO' | 'ENTREGADOR' | 'ADMIN'
export type StatusPagamento = 'PAGO' | 'RECEBER_NA_ENTREGA' | 'A_PRAZO'
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
  dataAgendada: Date | null
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
  horarioApos: string | null
  horarioAte: string | null
  descricaoProblema: string | null
  itensRetirados: string | null
  observacoes: string | null
  createdAt: Date
  pedido: {
    itens: string
    statusPagamento: string
  }
  cliente: {
    nome: string
    telefone: string | null
    endereco: string
    bairro: string
  }
  entregador: {
    id: string
    tipo: string
    user: { nome: string }
  } | null
  entrega: {
    dataEntrega: Date
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

