import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { invalidateCache } from '@/lib/cache'
import { auth } from '@/auth'

// ⚠️ APENAS PARA TESTE — Remove antes de produção

export async function POST() {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

    // Garantir que o usuário tem um Entregador record
    let entregador = await prisma.entregador.findFirst({
      where: { userId: session.user.id },
    })

    if (!entregador) {
      entregador = await prisma.entregador.create({
        data: {
          userId: session.user.id,
          tipo: 'MOTO',
          disponivel: true,
        },
      })
    }

    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)

    // Encontrar ou criar clientes de teste
    let cliente1 = await prisma.cliente.findFirst({
      where: { nome: 'João da Silva' },
    })
    if (!cliente1) {
      cliente1 = await prisma.cliente.create({
        data: {
          nome: 'João da Silva',
          telefone: '(19) 99801-2345',
          endereco: 'Rua das Flores',
          numero: '123',
          bairro: 'Centro',
          cidade: 'Serra Negra',
        },
      })
    }

    let cliente2 = await prisma.cliente.findFirst({
      where: { nome: 'Maria Santos' },
    })
    if (!cliente2) {
      cliente2 = await prisma.cliente.create({
        data: {
          nome: 'Maria Santos',
          telefone: '(19) 99802-3456',
          endereco: 'Av. Faria Lima',
          numero: '456',
          bairro: 'Jardim América',
          cidade: 'Serra Negra',
        },
      })
    }

    let cliente3 = await prisma.cliente.findFirst({
      where: { nome: 'Fazenda São José' },
    })
    if (!cliente3) {
      cliente3 = await prisma.cliente.create({
        data: {
          nome: 'Fazenda São José',
          telefone: '(19) 99803-4567',
          endereco: 'Estrada Municipal',
          numero: 'KM 5',
          bairro: 'Zona Rural',
          cidade: 'Serra Negra',
        },
      })
    }

    // Criar pedidos de teste
    const pedido1 = await prisma.pedido.create({
      data: {
        clienteId: cliente1.id,
        numeroCiss: `TEST-${Date.now()}-1`,
        valor: 450.0,
        itens: JSON.stringify([
          { descricao: 'Ração Cão Premium 20kg', quantidade: 2, valorUnit: 165 },
        ]),
        statusPagamento: 'PAGO',
        tipo: 'ENTREGA',
        status: 'AGUARDANDO_ENTREGA',
        origem: 'MANUAL',
      },
    })

    const pedido2 = await prisma.pedido.create({
      data: {
        clienteId: cliente2.id,
        numeroCiss: `TEST-${Date.now()}-2`,
        valor: 1250.0,
        itens: JSON.stringify([
          { descricao: 'Adubo NPK 50kg', quantidade: 5, valorUnit: 250 },
        ]),
        statusPagamento: 'RECEBER_NA_ENTREGA',
        tipo: 'ENTREGA',
        status: 'AGUARDANDO_ENTREGA',
        origem: 'MANUAL',
      },
    })

    const pedido3 = await prisma.pedido.create({
      data: {
        clienteId: cliente3.id,
        numeroCiss: `TEST-${Date.now()}-3`,
        valor: 6500.0,
        itens: JSON.stringify([
          { descricao: 'Calcário Dolomítico 1000kg', quantidade: 1, valorUnit: 6500 },
        ]),
        statusPagamento: 'PAGO',
        tipo: 'ENTREGA',
        status: 'AGUARDANDO_ENTREGA',
        origem: 'MANUAL',
      },
    })

    const pedido4 = await prisma.pedido.create({
      data: {
        clienteId: cliente1.id,
        numeroCiss: `TEST-${Date.now()}-4`,
        valor: 310.0,
        itens: JSON.stringify([
          { descricao: 'Sementes Milho Híbrido', quantidade: 10, valorUnit: 31 },
        ]),
        statusPagamento: 'RECEBER_NA_ENTREGA',
        tipo: 'ENTREGA',
        status: 'AGUARDANDO_ENTREGA',
        origem: 'MANUAL',
      },
    })

    const pedido5 = await prisma.pedido.create({
      data: {
        clienteId: cliente2.id,
        numeroCiss: `TEST-${Date.now()}-5`,
        valor: 890.0,
        itens: JSON.stringify([
          { descricao: 'Inseticida Carrapaticida 1L', quantidade: 12, valorUnit: 45 },
        ]),
        statusPagamento: 'PAGO',
        tipo: 'ENTREGA',
        status: 'AGUARDANDO_ENTREGA',
        origem: 'MANUAL',
      },
    })

    // Criar espetos no POOL (sem entregador, aguardando separação)
    const espeto1 = await prisma.espeto.create({
      data: {
        numero: Math.floor(1000 + Math.random() * 9000),
        pedidoId: pedido1.id,
        clienteId: cliente1.id,
        tipo: 'MOTO',
        prioridade: 'HOJE',
        status: 'PENDENTE',
        horarioApos: '08:00',
        horarioAte: '10:00',
        createdAt: hoje,
      },
    })

    const espeto2 = await prisma.espeto.create({
      data: {
        numero: Math.floor(1000 + Math.random() * 9000),
        pedidoId: pedido2.id,
        clienteId: cliente2.id,
        tipo: 'MOTO',
        prioridade: 'HOJE',
        status: 'PENDENTE',
        horarioApos: '10:00',
        horarioAte: '12:00',
        createdAt: hoje,
      },
    })

    const espeto3 = await prisma.espeto.create({
      data: {
        numero: Math.floor(1000 + Math.random() * 9000),
        pedidoId: pedido3.id,
        clienteId: cliente3.id,
        tipo: 'MOTO',
        prioridade: 'HOJE',
        status: 'PENDENTE',
        horarioApos: '09:00',
        horarioAte: '11:00',
        createdAt: hoje,
      },
    })

    const espeto4 = await prisma.espeto.create({
      data: {
        numero: Math.floor(1000 + Math.random() * 9000),
        pedidoId: pedido4.id,
        clienteId: cliente1.id,
        tipo: 'MOTO',
        prioridade: 'AMANHA',
        status: 'PENDENTE',
        horarioApos: '13:00',
        horarioAte: '14:00',
        createdAt: hoje,
      },
    })

    const espeto5 = await prisma.espeto.create({
      data: {
        numero: Math.floor(1000 + Math.random() * 9000),
        pedidoId: pedido5.id,
        clienteId: cliente2.id,
        tipo: 'MOTO',
        prioridade: 'HOJE',
        status: 'PENDENTE',
        horarioApos: '14:00',
        horarioAte: '16:00',
        createdAt: hoje,
      },
    })

    invalidateCache('espetos:')
    invalidateCache('dashboard:')

    return NextResponse.json({
      message: '✅ Pool de teste criado com sucesso!',
      espetos: [espeto1, espeto2, espeto3, espeto4, espeto5],
    })
  } catch (error) {
    console.error('[SEED POOL ERROR]', error)
    return NextResponse.json(
      { error: 'Erro ao criar espetos de teste', details: String(error) },
      { status: 500 }
    )
  }
}
