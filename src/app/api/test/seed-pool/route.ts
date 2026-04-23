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

    // Criar 5 clientes de teste
    const clientes = []
    const nomes = [
      'João da Silva (Teste)',
      'Maria Santos (Teste)',
      'Fazenda São José (Teste)',
      'Supermercado Central (Teste)',
      'Loja Marisa (Teste)',
    ]
    const enderecos = [
      { endereco: 'Rua das Flores', numero: '123', bairro: 'Centro', telefone: '(19) 99801-2345' },
      { endereco: 'Av. Faria Lima', numero: '456', bairro: 'Jardim América', telefone: '(19) 99802-3456' },
      { endereco: 'Estrada Municipal', numero: 'KM 5', bairro: 'Zona Rural', telefone: '(19) 99803-4567' },
      { endereco: 'Rua do Comércio', numero: '789', bairro: 'Vila Industrial', telefone: '(19) 99804-5678' },
      { endereco: 'Av. Principal', numero: '1000', bairro: 'Centro', telefone: '(19) 99805-6789' },
    ]

    for (let i = 0; i < 5; i++) {
      let cliente = await prisma.cliente.findFirst({ where: { nome: nomes[i] } })
      if (!cliente) {
        cliente = await prisma.cliente.create({
          data: {
            nome: nomes[i],
            telefone: enderecos[i].telefone,
            endereco: enderecos[i].endereco,
            numero: enderecos[i].numero,
            bairro: enderecos[i].bairro,
            cidade: 'Serra Negra',
          },
        })
      }
      clientes.push(cliente)
    }

    // Criar 10 pedidos com diferentes tipos de produtos
    const ts = Date.now()
    const produtos = [
      { descricao: 'Ração Cão Premium 20kg', quantidade: 2, valorUnit: 165 },
      { descricao: 'Adubo NPK 50kg', quantidade: 5, valorUnit: 250 },
      { descricao: 'Sementes Milho Híbrido', quantidade: 10, valorUnit: 31 },
      { descricao: 'Calcário Dolomítico 500kg', quantidade: 2, valorUnit: 350 },
      { descricao: 'Inseticida Carrapaticida 1L', quantidade: 12, valorUnit: 45 },
      { descricao: 'Fertilizante Líquido 5L', quantidade: 3, valorUnit: 120 },
      { descricao: 'Sementes Soja Transgênica', quantidade: 8, valorUnit: 95 },
      { descricao: 'Calcário Calcítico 1000kg', quantidade: 1, valorUnit: 650 },
      { descricao: 'Fungicida Sistêmico 500ml', quantidade: 6, valorUnit: 75 },
      { descricao: 'Sulfato de Potássio 25kg', quantidade: 4, valorUnit: 180 },
    ]

    const pedidos = []
    for (let i = 0; i < 10; i++) {
      const pedido = await prisma.pedido.create({
        data: {
          clienteId: clientes[i % 5].id,
          numeroCiss: `TESTE-${ts}-${i + 1}`,
          valor: Math.random() * 2000 + 200,
          itens: JSON.stringify([produtos[i]]),
          statusPagamento: ['PAGO', 'RECEBER_NA_ENTREGA', 'A_PRAZO'][Math.floor(Math.random() * 3)],
          tipo: 'ENTREGA',
          status: 'AGUARDANDO_ENTREGA',
          origem: 'MANUAL',
        },
      })
      pedidos.push(pedido)
    }

    // Criar 10 espetos (6 para hoje, 4 para amanhã)
    const espetos = []
    const horarios = [
      { apos: '08:00', ate: '10:00' },
      { apos: '10:00', ate: '12:00' },
      { apos: '12:00', ate: '14:00' },
      { apos: '14:00', ate: '16:00' },
      { apos: '16:00', ate: '18:00' },
      { apos: '18:00', ate: '20:00' },
    ]

    for (let i = 0; i < 10; i++) {
      const espeto = await prisma.espeto.create({
        data: {
          numero: Math.floor(1000 + Math.random() * 9000),
          pedidoId: pedidos[i].id,
          clienteId: clientes[i % 5].id,
          tipo: 'MOTO',
          prioridade: i < 6 ? 'HOJE' : 'AMANHA',
          status: 'PENDENTE',
          horarioApos: horarios[i % 6].apos,
          horarioAte: horarios[i % 6].ate,
          createdAt: new Date(hojeStr),
        },
      })
      espetos.push(espeto)
    }

    return NextResponse.json({
      ok: true,
      hojeUTC: hojeStr,
      estatisticas: {
        clientesCriados: clientes.length,
        pedidosCriados: pedidos.length,
        espetoCriados: espetos.length,
        espetoHoje: espetos.filter(e => e.prioridade === 'HOJE').length,
        espetoAmanha: espetos.filter(e => e.prioridade === 'AMANHA').length,
      },
      espetos: espetos.map(e => ({
        id: e.id,
        numero: e.numero,
        prioridade: e.prioridade,
        horario: `${e.horarioApos} - ${e.horarioAte}`,
      })),
    })
  } catch (error) {
    console.error('[SEED-POOL ERROR]', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
