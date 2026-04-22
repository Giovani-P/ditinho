import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// ⚠️ APENAS PARA TESTE — sem autenticação para facilitar testes

export async function POST() {
  try {
    const agora = new Date()
    const ano = agora.getUTCFullYear()
    const mes = String(agora.getUTCMonth() + 1).padStart(2, '0')
    const dia = String(agora.getUTCDate()).padStart(2, '0')
    const hojeStr = `${ano}-${mes}-${dia}T00:00:00Z`

    let cliente1 = await prisma.cliente.findFirst({ where: { nome: 'João da Silva (Teste)' } })
    if (!cliente1) {
      cliente1 = await prisma.cliente.create({
        data: {
          nome: 'João da Silva (Teste)',
          telefone: '(19) 99801-2345',
          endereco: 'Rua das Flores',
          numero: '123',
          bairro: 'Centro',
          cidade: 'Serra Negra',
        },
      })
    }

    let cliente2 = await prisma.cliente.findFirst({ where: { nome: 'Maria Santos (Teste)' } })
    if (!cliente2) {
      cliente2 = await prisma.cliente.create({
        data: {
          nome: 'Maria Santos (Teste)',
          telefone: '(19) 99802-3456',
          endereco: 'Av. Faria Lima',
          numero: '456',
          bairro: 'Jardim América',
          cidade: 'Serra Negra',
        },
      })
    }

    let cliente3 = await prisma.cliente.findFirst({ where: { nome: 'Fazenda São José (Teste)' } })
    if (!cliente3) {
      cliente3 = await prisma.cliente.create({
        data: {
          nome: 'Fazenda São José (Teste)',
          telefone: '(19) 99803-4567',
          endereco: 'Estrada Municipal',
          numero: 'KM 5',
          bairro: 'Zona Rural',
          cidade: 'Serra Negra',
        },
      })
    }

    const ts = Date.now()
    const pedido1 = await prisma.pedido.create({
      data: {
        clienteId: cliente1.id,
        numeroCiss: `TESTE-${ts}-1`,
        valor: 450.0,
        itens: JSON.stringify([{ descricao: 'Ração Cão Premium 20kg', quantidade: 2, valorUnit: 165 }]),
        statusPagamento: 'PAGO',
        tipo: 'ENTREGA',
        status: 'AGUARDANDO_ENTREGA',
        origem: 'MANUAL',
      },
    })
    const pedido2 = await prisma.pedido.create({
      data: {
        clienteId: cliente2.id,
        numeroCiss: `TESTE-${ts}-2`,
        valor: 1250.0,
        itens: JSON.stringify([{ descricao: 'Adubo NPK 50kg', quantidade: 5, valorUnit: 250 }]),
        statusPagamento: 'RECEBER_NA_ENTREGA',
        tipo: 'ENTREGA',
        status: 'AGUARDANDO_ENTREGA',
        origem: 'MANUAL',
      },
    })
    const pedido3 = await prisma.pedido.create({
      data: {
        clienteId: cliente3.id,
        numeroCiss: `TESTE-${ts}-3`,
        valor: 310.0,
        itens: JSON.stringify([{ descricao: 'Sementes Milho Híbrido', quantidade: 10, valorUnit: 31 }]),
        statusPagamento: 'RECEBER_NA_ENTREGA',
        tipo: 'ENTREGA',
        status: 'AGUARDANDO_ENTREGA',
        origem: 'MANUAL',
      },
    })

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
        createdAt: new Date(hojeStr),
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
        createdAt: new Date(hojeStr),
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
        createdAt: new Date(hojeStr),
      },
    })

    return NextResponse.json({
      ok: true,
      hojeUTC: hojeStr,
      espetos: [
        { id: espeto1.id, numero: espeto1.numero, createdAt: espeto1.createdAt },
        { id: espeto2.id, numero: espeto2.numero, createdAt: espeto2.createdAt },
        { id: espeto3.id, numero: espeto3.numero, createdAt: espeto3.createdAt },
      ],
    })
  } catch (error) {
    console.error('[SEED-POOL ERROR]', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
