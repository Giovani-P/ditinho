/**
 * Integração WhatsApp via Evolution API
 *
 * Self-hosted no VPS Hostinger — sem aprovação Meta, funciona com qualquer número.
 *
 * Configurar no .env.local:
 *   EVOLUTION_API_URL=http://SEU_VPS_IP:8080
 *   EVOLUTION_API_KEY=sua_chave_aqui
 *   EVOLUTION_INSTANCE=ditinho
 */

export function isWhatsAppConfigured(): boolean {
  return !!(
    process.env.EVOLUTION_API_URL &&
    process.env.EVOLUTION_API_KEY &&
    process.env.EVOLUTION_INSTANCE
  )
}

function normalizarTelefone(tel: string): string {
  // Remove tudo que não for dígito
  const digits = tel.replace(/\D/g, '')
  // Adiciona código do país se não tiver
  if (digits.startsWith('55')) return digits
  return `55${digits}`
}

async function enviarMensagem(telefone: string, texto: string): Promise<boolean> {
  if (!isWhatsAppConfigured()) return false

  const numero = normalizarTelefone(telefone)

  try {
    const res = await fetch(
      `${process.env.EVOLUTION_API_URL}/message/sendText/${process.env.EVOLUTION_INSTANCE}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: process.env.EVOLUTION_API_KEY!,
        },
        body: JSON.stringify({
          number: numero,
          text: texto,
        }),
        signal: AbortSignal.timeout(8000),
      }
    )

    if (!res.ok) {
      console.error('[WPP] Erro ao enviar mensagem:', res.status, await res.text())
      return false
    }

    return true
  } catch (err) {
    console.error('[WPP] Falha na chamada Evolution API:', err)
    return false
  }
}

async function enviarImagem(telefone: string, imageUrl: string, legenda: string): Promise<boolean> {
  if (!isWhatsAppConfigured()) return false

  const numero = normalizarTelefone(telefone)

  try {
    const res = await fetch(
      `${process.env.EVOLUTION_API_URL}/message/sendMedia/${process.env.EVOLUTION_INSTANCE}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: process.env.EVOLUTION_API_KEY!,
        },
        body: JSON.stringify({
          number: numero,
          mediatype: 'image',
          media: imageUrl,
          caption: legenda,
        }),
        signal: AbortSignal.timeout(10000),
      }
    )

    if (!res.ok) {
      console.error('[WPP] Erro ao enviar imagem:', res.status)
      return false
    }

    return true
  } catch (err) {
    console.error('[WPP] Falha ao enviar imagem:', err)
    return false
  }
}

// ─── Mensagens do sistema ────────────────────────────────────────────────────

export async function notificarEntregaRealizada(params: {
  telefone: string
  nomeCliente: string
  numeroPedido: string | number
  valor: number
  fotoUrl?: string | null
}): Promise<void> {
  if (!isWhatsAppConfigured()) return

  const { telefone, nomeCliente, numeroPedido, valor, fotoUrl } = params

  const primeiroNome = nomeCliente.split(' ')[0]

  const mensagem = [
    `Olá, ${primeiroNome}! 👋`,
    ``,
    `✅ *Seu pedido foi entregue!*`,
    ``,
    `📦 Pedido: #${numeroPedido}`,
    `💰 Valor: R$ ${valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
    ``,
    `Obrigado pela confiança na Agropecuária Ditinho! 🌾`,
    `Qualquer dúvida, estamos à disposição.`,
  ].join('\n')

  if (fotoUrl) {
    // Envia foto com a mensagem como legenda
    const enviou = await enviarImagem(telefone, fotoUrl, mensagem)
    if (!enviou) {
      // Fallback: envia só o texto
      await enviarMensagem(telefone, mensagem)
    }
  } else {
    await enviarMensagem(telefone, mensagem)
  }
}

export async function notificarPedidoEmRota(params: {
  telefone: string
  nomeCliente: string
  numeroPedido: string | number
  nomeEntregador?: string
  horarioEst?: string | null
}): Promise<void> {
  if (!isWhatsAppConfigured()) return

  const { telefone, nomeCliente, numeroPedido, nomeEntregador, horarioEst } = params

  const primeiroNome = nomeCliente.split(' ')[0]

  const linhas = [
    `Olá, ${primeiroNome}! 🏍️`,
    ``,
    `*Seu pedido #${numeroPedido} saiu para entrega!*`,
  ]

  if (nomeEntregador) {
    linhas.push(``, `Entregador: ${nomeEntregador}`)
  }

  if (horarioEst) {
    linhas.push(`Previsão de chegada: ${horarioEst}`)
  }

  linhas.push(``, `Agropecuária Ditinho 🌾`)

  await enviarMensagem(telefone, linhas.join('\n'))
}
