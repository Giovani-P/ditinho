import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import bcrypt from 'bcryptjs'
import path from 'path'

const dbPath = path.resolve(process.cwd(), 'dev.db')
const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Iniciando seed...')

  // Limpar dados existentes
  await prisma.entrega.deleteMany()
  await prisma.espeto.deleteMany()
  await prisma.pedido.deleteMany()
  await prisma.entregador.deleteMany()
  await prisma.auditLog.deleteMany()
  await prisma.cliente.deleteMany()
  await prisma.user.deleteMany()

  // Criar usuários
  const senhaHash = async (senha: string) => bcrypt.hash(senha, 10)

  const admin = await prisma.user.create({
    data: {
      nome: 'Ditinho (Admin)',
      email: 'admin@ditinho.com',
      senha: await senhaHash('admin123'),
      perfil: 'ADMIN',
    },
  })

  const vendedor = await prisma.user.create({
    data: {
      nome: 'Carlos Vendedor',
      email: 'vendedor@ditinho.com',
      senha: await senhaHash('vendedor123'),
      perfil: 'VENDEDOR',
    },
  })

  const logistica = await prisma.user.create({
    data: {
      nome: 'Ana Logística',
      email: 'logistica@ditinho.com',
      senha: await senhaHash('logistica123'),
      perfil: 'LOGISTICA',
    },
  })

  const userEntregadorMoto = await prisma.user.create({
    data: {
      nome: 'Francisco Moto',
      email: 'entregador@ditinho.com',
      senha: await senhaHash('entregador123'),
      perfil: 'ENTREGADOR',
    },
  })

  const userEntregadorCaminhao = await prisma.user.create({
    data: {
      nome: 'Roberto Caminhão',
      email: 'roberto@ditinho.com',
      senha: await senhaHash('roberto123'),
      perfil: 'ENTREGADOR',
    },
  })

  console.log('✅ Usuários criados')

  // Criar entregadores
  const entregadorMoto = await prisma.entregador.create({
    data: {
      userId: userEntregadorMoto.id,
      tipo: 'MOTO',
      disponivel: true,
    },
  })

  const entregadorCaminhao = await prisma.entregador.create({
    data: {
      userId: userEntregadorCaminhao.id,
      tipo: 'CAMINHAO',
      disponivel: true,
    },
  })

  console.log('✅ Entregadores criados')

  // Criar clientes
  const clientes = await Promise.all([
    prisma.cliente.create({
      data: {
        nome: 'João da Silva',
        telefone: '(19) 99801-2345',
        endereco: 'Rua das Flores',
        numero: '123',
        bairro: 'Centro',
        cidade: 'Serra Negra',
        cep: '13930-000',
        referencia: 'Próximo ao Banco do Brasil',
      },
    }),
    prisma.cliente.create({
      data: {
        nome: 'Maria Santos',
        telefone: '(19) 99802-3456',
        endereco: 'Av. Faria Lima',
        numero: '456',
        bairro: 'Jardim América',
        cidade: 'Serra Negra',
        referencia: 'Casa amarela com portão azul',
      },
    }),
    prisma.cliente.create({
      data: {
        nome: 'Fazenda São José',
        telefone: '(19) 99803-4567',
        endereco: 'Estrada Municipal',
        numero: 'KM 5',
        bairro: 'Zona Rural',
        cidade: 'Serra Negra',
        observacoes: 'Portão sempre fechado — ligar antes',
      },
    }),
    prisma.cliente.create({
      data: {
        nome: 'Pedro Oliveira',
        telefone: '(19) 99804-5678',
        endereco: 'Rua Coronel Menezes',
        numero: '78',
        bairro: 'Boa Vista',
        cidade: 'Serra Negra',
      },
    }),
    prisma.cliente.create({
      data: {
        nome: 'Sítio Santa Rosa',
        telefone: '(19) 99805-6789',
        endereco: 'Rod. SP-050',
        numero: 'KM 12',
        bairro: 'Zona Rural',
        cidade: 'Serra Negra',
        observacoes: 'Entregar somente pela manhã',
      },
    }),
  ])

  console.log('✅ Clientes criados')

  // Criar pedidos
  const pedidos = await Promise.all([
    prisma.pedido.create({
      data: {
        clienteId: clientes[0].id,
        numeroCiss: 'PED-001',
        valor: 450.00,
        itens: JSON.stringify([
          { produto: 'Ração Cão 20kg', qtd: 2, valor: 180.00 },
          { produto: 'Vermífugo Bovino', qtd: 3, valor: 90.00 },
        ]),
        statusPagamento: 'PAGO',
        tipo: 'ENTREGA',
        status: 'NOVO',
        origem: 'CISS_POWER',
      },
    }),
    prisma.pedido.create({
      data: {
        clienteId: clientes[1].id,
        numeroCiss: 'PED-002',
        valor: 1250.00,
        itens: JSON.stringify([
          { produto: 'Adubo NPK 50kg', qtd: 5, valor: 250.00 },
        ]),
        statusPagamento: 'NAO_PAGO',
        tipo: 'ENTREGA',
        status: 'NOVO',
        origem: 'MANUAL',
      },
    }),
    prisma.pedido.create({
      data: {
        clienteId: clientes[2].id,
        numeroCiss: 'PED-003',
        valor: 3800.00,
        itens: JSON.stringify([
          { produto: 'Sal Mineral 30kg', qtd: 10, valor: 380.00 },
        ]),
        statusPagamento: 'PAGO',
        tipo: 'ENTREGA',
        status: 'AGUARDANDO_ENTREGA',
        origem: 'CISS_POWER',
      },
    }),
    prisma.pedido.create({
      data: {
        clienteId: clientes[3].id,
        numeroCiss: 'PED-004',
        valor: 220.00,
        itens: JSON.stringify([
          { produto: 'Herbicida 1L', qtd: 4, valor: 55.00 },
        ]),
        statusPagamento: 'PENDENTE',
        tipo: 'ENTREGA',
        status: 'NOVO',
        origem: 'MANUAL',
      },
    }),
    prisma.pedido.create({
      data: {
        clienteId: clientes[4].id,
        numeroCiss: 'PED-005',
        valor: 6500.00,
        itens: JSON.stringify([
          { produto: 'Calcário 1000kg', qtd: 1, valor: 6500.00 },
        ]),
        statusPagamento: 'PAGO',
        tipo: 'ENTREGA',
        status: 'EM_ROTA',
        origem: 'CISS_POWER',
      },
    }),
  ])

  console.log('✅ Pedidos criados')

  // Criar espetos (para pedidos 3, 5)
  await prisma.espeto.create({
    data: {
      numero: 1001,
      pedidoId: pedidos[2].id,
      clienteId: clientes[2].id,
      entregadorId: entregadorCaminhao.id,
      tipo: 'CAMINHAO',
      prioridade: 'HOJE',
      status: 'PENDENTE',
      horarioEst: '10:00',
    },
  })

  await prisma.espeto.create({
    data: {
      numero: 1002,
      pedidoId: pedidos[4].id,
      clienteId: clientes[4].id,
      entregadorId: entregadorCaminhao.id,
      tipo: 'CAMINHAO',
      prioridade: 'HOJE',
      status: 'EM_ROTA',
      horarioEst: '14:00',
    },
  })

  await prisma.espeto.create({
    data: {
      numero: 1003,
      pedidoId: pedidos[0].id,
      clienteId: clientes[0].id,
      entregadorId: entregadorMoto.id,
      tipo: 'MOTO',
      prioridade: 'HOJE',
      status: 'ENTREGUE',
      horarioEst: '09:00',
    },
  })

  console.log('✅ Espetos criados')

  console.log('\n🎉 Seed completo!')
  console.log('\n📋 Acessos demo:')
  console.log('   👑 Admin:      admin@ditinho.com / admin123')
  console.log('   🛒 Vendedor:   vendedor@ditinho.com / vendedor123')
  console.log('   🗺️  Logística:  logistica@ditinho.com / logistica123')
  console.log('   🏍️  Entregador: entregador@ditinho.com / entregador123')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
