import { redirect } from 'next/navigation'

// Criação manual de pedidos foi desativada.
// Todos os pedidos entram via importação automática da CissPoder.
export default function NovoPedidoPage() {
  redirect('/vendedor')
}
