import { prisma } from './prisma'

export async function registrarAuditLog(
  userId: string,
  acao: string,
  entidade: string,
  entidadeId: string,
  valorAnterior?: string,
  valorNovo?: string
) {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        acao,
        entidade,
        entidadeId,
        valorAnterior,
        valorNovo,
      },
    })
  } catch (error) {
    console.error('[AUDIT LOG ERROR]', error)
    // Não falha se audit log não conseguir ser registrado
  }
}
