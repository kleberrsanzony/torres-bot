/**
 * Motor de Geração de Copy para WhatsApp
 * 3 estilos: Vendedor Direto, Varejo Popular, Premium
 */
import type { EstiloCopy } from '@/types'
import { formatarPreco, calcularDesconto } from '@/lib/utils'

interface DadosCopy {
  nomeProduto: string
  sku: string
  precoDe: number
  precoPor: number
  linkMercadoLivre: string
  descricao?: string
  urgencia?: string
}

/**
 * Gera copy de venda no estilo Vendedor Direto
 * Curto, objetivo, foco em conversão rápida
 */
function gerarCopyVendedor(dados: DadosCopy): string {
  const desconto = calcularDesconto(dados.precoDe, dados.precoPor)
  const linhas: string[] = [
    `⚡ OFERTA DO DIA ⚡`,
    ``,
    `📦 ${dados.nomeProduto}`,
    ``,
    `🔥 De: ${formatarPreco(dados.precoDe)}`,
    `💥 Por: ${formatarPreco(dados.precoPor)}`,
    desconto > 0 ? `🏷️ Economia de ${desconto}%` : '',
    ``,
  ]

  if (dados.descricao) {
    linhas.push(`🚀 ${dados.descricao}`, ``)
  }

  if (dados.urgencia) {
    linhas.push(`⏰ ${dados.urgencia}`, ``)
  }

  linhas.push(
    `🛒 Compre com segurança:`,
    dados.linkMercadoLivre,
  )

  if (dados.sku) {
    linhas.push(``, `📋 SKU: ${dados.sku}`)
  }

  return linhas.filter((l) => l !== undefined).join('\n')
}

/**
 * Gera copy no estilo Varejo Popular
 * Chamativo, estilo promoção de loja, mais emojis
 */
function gerarCopyVarejo(dados: DadosCopy): string {
  const desconto = calcularDesconto(dados.precoDe, dados.precoPor)
  const linhas: string[] = [
    `🔥🔥🔥 PROMOÇÃO IMPERDÍVEL 🔥🔥🔥`,
    ``,
    `🎯 ${dados.nomeProduto.toUpperCase()}`,
    ``,
    `❌ Era: ${formatarPreco(dados.precoDe)}`,
    `✅ AGORA: ${formatarPreco(dados.precoPor)}`,
    desconto > 0 ? `💰 DESCONTO DE ${desconto}%!!` : '',
    ``,
  ]

  if (dados.descricao) {
    linhas.push(`⭐ ${dados.descricao}`, ``)
  }

  linhas.push(
    `📦 ESTOQUE LIMITADO!`,
    ``,
    dados.urgencia ? `🚨 ${dados.urgencia}` : `🚨 CORRE QUE ACABA RÁPIDO!`,
    ``,
    `👉 GARANTA O SEU AQUI:`,
    dados.linkMercadoLivre,
    ``,
    `💬 Dúvidas? Chama no WhatsApp! 🟢`,
  )

  if (dados.sku) {
    linhas.push(``, `Código: ${dados.sku}`)
  }

  return linhas.filter((l) => l !== undefined).join('\n')
}

/**
 * Gera copy no estilo Premium
 * Limpo, elegante, credível
 */
function gerarCopyPremium(dados: DadosCopy): string {
  const desconto = calcularDesconto(dados.precoDe, dados.precoPor)
  const linhas: string[] = [
    `─── Oferta Selecionada ───`,
    ``,
    `${dados.nomeProduto}`,
    ``,
    `Valor original: ${formatarPreco(dados.precoDe)}`,
    `Oferta especial: ${formatarPreco(dados.precoPor)}`,
    desconto > 0 ? `Economia de ${desconto}%` : '',
    ``,
  ]

  if (dados.descricao) {
    linhas.push(`${dados.descricao}`, ``)
  }

  linhas.push(
    `✓ Produto original com garantia`,
    `✓ Envio rápido e seguro`,
    `✓ Compra protegida pelo Mercado Livre`,
    ``,
    `Acesse a oferta:`,
    dados.linkMercadoLivre,
  )

  if (dados.urgencia) {
    linhas.push(``, `${dados.urgencia}`)
  }

  if (dados.sku) {
    linhas.push(``, `Ref: ${dados.sku}`)
  }

  return linhas.filter((l) => l !== undefined).join('\n')
}

/**
 * Gera copy segundo o estilo selecionado
 */
export function gerarCopy(estilo: EstiloCopy, dados: DadosCopy): string {
  switch (estilo) {
    case 'vendedor':
      return gerarCopyVendedor(dados)
    case 'varejo':
      return gerarCopyVarejo(dados)
    case 'premium':
      return gerarCopyPremium(dados)
    default:
      return gerarCopyVendedor(dados)
  }
}

/**
 * Gera 3 versões de copy (uma de cada estilo)
 */
export function gerarTresVersoes(dados: DadosCopy): Record<EstiloCopy, string> {
  return {
    vendedor: gerarCopyVendedor(dados),
    varejo: gerarCopyVarejo(dados),
    premium: gerarCopyPremium(dados),
  }
}

/**
 * Encurta uma copy removendo linhas desnecessárias
 */
export function encurtarCopy(copy: string): string {
  return copy
    .split('\n')
    .filter((l) => l.trim() !== '' || l === '')
    .filter((_, i, arr) => {
      // Remove linhas em branco consecutivas
      if (i === 0) return true
      return !(arr[i] === '' && arr[i - 1] === '')
    })
    .join('\n')
    .trim()
}

/**
 * Torna a copy mais vendedora adicionando urgência
 */
export function maisVendedor(copy: string): string {
  let resultado = copy
  if (!resultado.includes('AGORA')) {
    resultado = resultado.replace(
      /Por:/,
      'AGORA POR APENAS:'
    )
  }
  if (!resultado.includes('ÚLTIMAS UNIDADES')) {
    resultado += '\n\n🚨 ÚLTIMAS UNIDADES! Não perca essa oportunidade!'
  }
  return resultado
}

/**
 * Torna a copy mais premium removendo emojis excessivos
 */
export function maisPremium(copy: string): string {
  return copy
    .replace(/🔥|💥|🚨|❌|✅|⭐|👉|💰|🎯/g, '')
    .replace(/!{2,}/g, '.')
    .replace(/CORRE QUE ACABA RÁPIDO!/g, 'Disponibilidade limitada.')
    .replace(/PROMOÇÃO IMPERDÍVEL/g, 'Oferta Especial')
    .replace(/GARANTA O SEU AQUI:/g, 'Acesse:')
    .trim()
}
