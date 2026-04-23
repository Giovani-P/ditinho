import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// ⚠️ APENAS PARA TESTE — limpa dados criados por seed-pool

export async function POST() {
  try {
    // Buscar todos os pedidos com numeroCiss começando com TESTE-
    const pedidosDeleted = await prisma.pedido.deleteMany({
      where: {
        numeroCiss: { startsWith: 'TESTE-' },
      },
    })

    // Buscar clientes com "(Teste)" no nome
    const clientesDeleted = await prisma.cliente.deleteMany({
      where: {
        nome: { contains: '(Teste)' },
      },
    })

    return NextResponse.json({
      ok: true,
      deletedPedidos: pedidosDeleted.count,
      deletedClientes: clientesDeleted.count,
      message: 'Dados de teste removidos com sucesso',
    })
  } catch (error) {
    console.error('[CLEANUP-POOL ERROR]', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
