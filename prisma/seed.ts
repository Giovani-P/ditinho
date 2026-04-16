import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import * as dotenv from 'dotenv'
import * as path from 'path'
import * as fs from 'fs'
import bcrypt from 'bcryptjs'

// Carrega .env.local (Next.js convention)
const envLocal = path.resolve(process.cwd(), '.env.local')
if (fs.existsSync(envLocal)) dotenv.config({ path: envLocal })

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
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

  const senhaHash = async (senha: string) => bcrypt.hash(senha, 10)

  // ─── USUÁRIOS ───────────────────────────────────────────────
  const admin = await prisma.user.create({
    data: { nome: 'Ditinho (Admin)', email: 'admin@ditinho.com', senha: await senhaHash('admin123'), perfil: 'ADMIN' },
  })

  await prisma.user.create({
    data: { nome: 'Carlos Vendedor', email: 'vendedor@ditinho.com', senha: await senhaHash('vendedor123'), perfil: 'VENDEDOR' },
  })

  await prisma.user.create({
    data: { nome: 'Ana Logística', email: 'logistica@ditinho.com', senha: await senhaHash('logistica123'), perfil: 'LOGISTICA' },
  })

  await prisma.user.create({
    data: { nome: 'Beatriz Financeiro', email: 'financeiro@ditinho.com', senha: await senhaHash('financeiro123'), perfil: 'FINANCEIRO' },
  })

  const userMoto1 = await prisma.user.create({
    data: { nome: 'Francisco Moto', email: 'entregador@ditinho.com', senha: await senhaHash('entregador123'), perfil: 'ENTREGADOR' },
  })

  const userMoto2 = await prisma.user.create({
    data: { nome: 'Lucas Moto', email: 'lucas@ditinho.com', senha: await senhaHash('lucas123'), perfil: 'ENTREGADOR' },
  })

  const userCaminhao1 = await prisma.user.create({
    data: { nome: 'Roberto Caminhão', email: 'roberto@ditinho.com', senha: await senhaHash('roberto123'), perfil: 'ENTREGADOR' },
  })

  const userCaminhao2 = await prisma.user.create({
    data: { nome: 'Márcio Caminhão', email: 'marcio@ditinho.com', senha: await senhaHash('marcio123'), perfil: 'ENTREGADOR' },
  })

  console.log('✅ Usuários criados')

  // ─── ENTREGADORES ────────────────────────────────────────────
  const moto1 = await prisma.entregador.create({ data: { userId: userMoto1.id, tipo: 'MOTO', disponivel: true } })
  const moto2 = await prisma.entregador.create({ data: { userId: userMoto2.id, tipo: 'MOTO', disponivel: true } })
  const caminhao1 = await prisma.entregador.create({ data: { userId: userCaminhao1.id, tipo: 'CAMINHAO', disponivel: true } })
  const caminhao2 = await prisma.entregador.create({ data: { userId: userCaminhao2.id, tipo: 'CAMINHAO', disponivel: true } })

  console.log('✅ Entregadores criados')

  // ─── CLIENTES ────────────────────────────────────────────────
  const clientes = await Promise.all([
    prisma.cliente.create({ data: { nome: 'João da Silva', telefone: '(19) 99801-2345', endereco: 'Rua das Flores', numero: '123', bairro: 'Centro', cidade: 'Serra Negra', cep: '13930-000', referencia: 'Próximo ao Banco do Brasil' } }),
    prisma.cliente.create({ data: { nome: 'Maria Santos', telefone: '(19) 99802-3456', endereco: 'Av. Faria Lima', numero: '456', bairro: 'Jardim América', cidade: 'Serra Negra', referencia: 'Casa amarela com portão azul' } }),
    prisma.cliente.create({ data: { nome: 'Fazenda São José', telefone: '(19) 99803-4567', endereco: 'Estrada Municipal', numero: 'KM 5', bairro: 'Zona Rural', cidade: 'Serra Negra', observacoes: 'Portão sempre fechado — ligar antes' } }),
    prisma.cliente.create({ data: { nome: 'Pedro Oliveira', telefone: '(19) 99804-5678', endereco: 'Rua Coronel Menezes', numero: '78', bairro: 'Boa Vista', cidade: 'Serra Negra' } }),
    prisma.cliente.create({ data: { nome: 'Sítio Santa Rosa', telefone: '(19) 99805-6789', endereco: 'Rod. SP-050', numero: 'KM 12', bairro: 'Zona Rural', cidade: 'Serra Negra', observacoes: 'Entregar somente pela manhã' } }),
    prisma.cliente.create({ data: { nome: 'Ana Paula Costa', telefone: '(19) 99806-7890', endereco: 'Rua das Acácias', numero: '210', bairro: 'Jardim das Rosas', cidade: 'Serra Negra', referencia: 'Sobrado verde, próximo à escola' } }),
    prisma.cliente.create({ data: { nome: 'Carlos Mendes', telefone: '(19) 99807-8901', endereco: 'Rua São João', numero: '55', bairro: 'São João', cidade: 'Serra Negra' } }),
    prisma.cliente.create({ data: { nome: 'Granja Esperança', telefone: '(19) 99808-9012', endereco: 'Estrada da Granja', numero: 'SN', bairro: 'Zona Rural', cidade: 'Serra Negra', observacoes: 'Ligar para confirmar horário — portão eletrônico' } }),
    prisma.cliente.create({ data: { nome: 'Antônio Ferreira', telefone: '(19) 99809-0123', endereco: 'Rua Tiradentes', numero: '321', bairro: 'Vila Nova', cidade: 'Serra Negra', referencia: 'Em frente à farmácia' } }),
    prisma.cliente.create({ data: { nome: 'Cooperativa Agro Serra', telefone: '(19) 3896-1234', endereco: 'Av. Industrial', numero: '1500', bairro: 'Distrito Industrial', cidade: 'Serra Negra', observacoes: 'Entrar pela portaria lateral — pedir por Wanderley' } }),
    prisma.cliente.create({ data: { nome: 'Fernanda Lima', telefone: '(19) 99811-2345', endereco: 'Rua Voluntários da Pátria', numero: '44', bairro: 'Centro', cidade: 'Serra Negra' } }),
    prisma.cliente.create({ data: { nome: 'Sítio Boa Esperança', telefone: '(19) 99812-3456', endereco: 'Estrada Velha de Amparo', numero: 'KM 3', bairro: 'Zona Rural', cidade: 'Serra Negra', referencia: 'Segunda porteira à direita' } }),
    prisma.cliente.create({ data: { nome: 'Marcelo Ribeiro', telefone: '(19) 99813-4567', endereco: 'Rua Marechal Deodoro', numero: '88', bairro: 'Bairro Alto', cidade: 'Serra Negra' } }),
  ])

  console.log('✅ Clientes criados')

  // ─── PEDIDOS ─────────────────────────────────────────────────
  // ATENÇÃO: campo correto é { descricao, quantidade, valorUnit }

  // 🔴 CISS — NOVO (sem espeto — gerente precisa definir entrega)
  const pedCiss1 = await prisma.pedido.create({
    data: {
      clienteId: clientes[2].id, // Fazenda São José
      numeroCiss: 'CISS-4501',
      valor: 4780.00,
      itens: JSON.stringify([
        { descricao: 'Sal Mineral Bovinos 30kg', quantidade: 8, valorUnit: 280.00 },
        { descricao: 'Ureia 50kg', quantidade: 5, valorUnit: 220.00 },
        { descricao: 'Vacina Aftosa 10 doses', quantidade: 3, valorUnit: 120.00 },
      ]),
      statusPagamento: 'PAGO',
      tipo: 'ENTREGA',
      status: 'NOVO',
      origem: 'CISS_POWER',
    },
  })

  const pedCiss2 = await prisma.pedido.create({
    data: {
      clienteId: clientes[7].id, // Granja Esperança
      numeroCiss: 'CISS-4502',
      valor: 2340.00,
      itens: JSON.stringify([
        { descricao: 'Ração Aves 30kg', quantidade: 6, valorUnit: 185.00 },
        { descricao: 'Inseticida Carrapaticida 1L', quantidade: 12, valorUnit: 45.00 },
        { descricao: 'Bebedouro Automático Galinha', quantidade: 4, valorUnit: 78.00 },
      ]),
      statusPagamento: 'RECEBER_NA_ENTREGA',
      tipo: 'ENTREGA',
      status: 'NOVO',
      origem: 'CISS_POWER',
    },
  })

  const pedCiss3 = await prisma.pedido.create({
    data: {
      clienteId: clientes[9].id, // Cooperativa Agro Serra
      numeroCiss: 'CISS-4503',
      valor: 12800.00,
      itens: JSON.stringify([
        { descricao: 'Calcário Dolomítico 1000kg', quantidade: 2, valorUnit: 4200.00 },
        { descricao: 'Adubo NPK 25-05-25 50kg', quantidade: 10, valorUnit: 280.00 },
        { descricao: 'Herbicida Roundup 5L', quantidade: 4, valorUnit: 350.00 },
      ]),
      statusPagamento: 'PAGO',
      tipo: 'ENTREGA',
      status: 'NOVO',
      origem: 'CISS_POWER',
    },
  })

  const pedCiss4 = await prisma.pedido.create({
    data: {
      clienteId: clientes[11].id, // Sítio Boa Esperança
      numeroCiss: 'CISS-4504',
      valor: 1650.00,
      itens: JSON.stringify([
        { descricao: 'Semente de Capim Tifton 5kg', quantidade: 10, valorUnit: 95.00 },
        { descricao: 'Adubo Orgânico 20kg', quantidade: 8, valorUnit: 68.75 },
      ]),
      statusPagamento: 'RECEBER_NA_ENTREGA',
      tipo: 'ENTREGA',
      status: 'NOVO',
      origem: 'CISS_POWER',
    },
  })

  // 🔵 MANUAL — NOVO (sem espeto)
  const pedManual1 = await prisma.pedido.create({
    data: {
      clienteId: clientes[0].id, // João da Silva
      numeroCiss: 'MAN-001',
      valor: 430.00,
      itens: JSON.stringify([
        { descricao: 'Ração Cão Premium 20kg', quantidade: 2, valorUnit: 165.00 },
        { descricao: 'Vermífugo Bovino 500ml', quantidade: 2, valorUnit: 50.00 },
      ]),
      statusPagamento: 'PAGO',
      tipo: 'ENTREGA',
      status: 'NOVO',
      origem: 'MANUAL',
    },
  })

  const pedManual2 = await prisma.pedido.create({
    data: {
      clienteId: clientes[5].id, // Ana Paula Costa
      numeroCiss: 'MAN-002',
      valor: 310.00,
      itens: JSON.stringify([
        { descricao: 'Ração Gato Adulto 10kg', quantidade: 2, valorUnit: 120.00 },
        { descricao: 'Areia Sanitária 4kg', quantidade: 3, valorUnit: 23.33 },
      ]),
      statusPagamento: 'RECEBER_NA_ENTREGA',
      tipo: 'ENTREGA',
      status: 'NOVO',
      origem: 'MANUAL',
    },
  })

  // 🟡 AGUARDANDO ENTREGA — com espeto PENDENTE
  const pedAguardando1 = await prisma.pedido.create({
    data: {
      clienteId: clientes[4].id, // Sítio Santa Rosa
      numeroCiss: 'CISS-4490',
      valor: 6500.00,
      itens: JSON.stringify([
        { descricao: 'Calcário Dolomítico 1000kg', quantidade: 1, valorUnit: 6500.00 },
      ]),
      statusPagamento: 'PAGO',
      tipo: 'ENTREGA',
      status: 'AGUARDANDO_ENTREGA',
      origem: 'CISS_POWER',
    },
  })

  const pedAguardando2 = await prisma.pedido.create({
    data: {
      clienteId: clientes[1].id, // Maria Santos
      numeroCiss: 'MAN-003',
      valor: 1250.00,
      itens: JSON.stringify([
        { descricao: 'Adubo NPK 50kg', quantidade: 5, valorUnit: 250.00 },
      ]),
      statusPagamento: 'RECEBER_NA_ENTREGA',
      tipo: 'ENTREGA',
      status: 'AGUARDANDO_ENTREGA',
      origem: 'MANUAL',
    },
  })

  // 🟠 EM ROTA
  const pedEmRota = await prisma.pedido.create({
    data: {
      clienteId: clientes[3].id, // Pedro Oliveira
      numeroCiss: 'MAN-004',
      valor: 318.00,
      itens: JSON.stringify([
        { descricao: 'Herbicida 2,4-D 1L', quantidade: 4, valorUnit: 52.00 },
        { descricao: 'Pulverizador Costal 20L', quantidade: 1, valorUnit: 110.00 },
      ]),
      statusPagamento: 'PAGO',
      tipo: 'ENTREGA',
      status: 'EM_ROTA',
      origem: 'CISS_POWER',
    },
  })

  // ✅ ENTREGUE (histórico)
  const pedEntregue = await prisma.pedido.create({
    data: {
      clienteId: clientes[6].id, // Carlos Mendes
      numeroCiss: 'MAN-005',
      valor: 560.00,
      itens: JSON.stringify([
        { descricao: 'Ração Bovinos Engorda 30kg', quantidade: 4, valorUnit: 140.00 },
      ]),
      statusPagamento: 'PAGO',
      tipo: 'ENTREGA',
      status: 'ENTREGUE',
      origem: 'MANUAL',
    },
  })

  // 🏪 RETIRADA na loja
  await prisma.pedido.create({
    data: {
      clienteId: clientes[12].id, // Marcelo Ribeiro
      numeroCiss: 'MAN-006',
      valor: 185.00,
      itens: JSON.stringify([
        { descricao: 'Fio de Cerca Liso 1mm 500m', quantidade: 1, valorUnit: 185.00 },
      ]),
      statusPagamento: 'PAGO',
      tipo: 'RETIRADA',
      status: 'ENTREGUE',
      origem: 'MANUAL',
    },
  })

  console.log('✅ Pedidos criados')

  // ─── ESPETOS ─────────────────────────────────────────────────
  // Apenas para pedidos que já passaram do NOVO

  await prisma.espeto.create({
    data: {
      numero: 1001,
      pedidoId: pedAguardando1.id,
      clienteId: clientes[4].id,
      entregadorId: caminhao1.id,
      tipo: 'CAMINHAO',
      prioridade: 'HOJE',
      status: 'PENDENTE',
      horarioEst: '10:00',
    },
  })

  await prisma.espeto.create({
    data: {
      numero: 1002,
      pedidoId: pedAguardando2.id,
      clienteId: clientes[1].id,
      entregadorId: moto1.id,
      tipo: 'MOTO',
      prioridade: 'HOJE',
      status: 'PENDENTE',
      horarioEst: '11:30',
    },
  })

  await prisma.espeto.create({
    data: {
      numero: 1003,
      pedidoId: pedEmRota.id,
      clienteId: clientes[3].id,
      entregadorId: moto2.id,
      tipo: 'MOTO',
      prioridade: 'HOJE',
      status: 'EM_ROTA',
      horarioEst: '09:00',
    },
  })

  await prisma.espeto.create({
    data: {
      numero: 1000,
      pedidoId: pedEntregue.id,
      clienteId: clientes[6].id,
      entregadorId: moto1.id,
      tipo: 'MOTO',
      prioridade: 'HOJE',
      status: 'ENTREGUE',
      horarioEst: '08:30',
    },
  })

  console.log('✅ Espetos criados')

  console.log('\n🎉 Seed completo!')
  console.log('\n📋 Acessos demo:')
  console.log('   👑 Admin:      admin@ditinho.com / admin123')
  console.log('   🛒 Vendedor:   vendedor@ditinho.com / vendedor123')
  console.log('   🗺️  Logística:  logistica@ditinho.com / logistica123')
  console.log('   💰 Financeiro: financeiro@ditinho.com / financeiro123')
  console.log('   🏍️  Moto 1:     entregador@ditinho.com / entregador123')
  console.log('   🏍️  Moto 2:     lucas@ditinho.com / lucas123')
  console.log('   🚚 Caminhão 1: roberto@ditinho.com / roberto123')
  console.log('   🚚 Caminhão 2: marcio@ditinho.com / marcio123')
  console.log('\n🛒 Pedidos prontos para simular:')
  console.log('   CISS-4501, CISS-4502, CISS-4503, CISS-4504 — NOVOS sem espeto (escolha moto/caminhão)')
  console.log('   MAN-001, MAN-002 — Manuais sem espeto')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
