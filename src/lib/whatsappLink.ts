/**
 * Gerador de links do WhatsApp
 * Cria URLs wa.me com mensagem formatada.
 */

/**
 * Formata número de telefone para WhatsApp (Brasil)
 * Remove caracteres, adiciona prefixo 55 se necessário
 */
export function formatarNumeroWA(numero: string): string {
  const limpo = numero.replace(/\D/g, '')
  if (limpo.startsWith('55')) return limpo
  return `55${limpo}`
}

/**
 * Gera link do WhatsApp com mensagem pré-preenchida
 */
export function gerarLinkWhatsApp(numero: string, mensagem: string): string {
  const tel = formatarNumeroWA(numero)
  const texto = encodeURIComponent(mensagem)
  return `https://wa.me/${tel}?text=${texto}`
}

/**
 * Gera link do WhatsApp com produto e SKU
 */
export function gerarLinkWhatsAppProduto(
  numero: string,
  nomeProduto: string,
  sku?: string,
): string {
  let msg = `Olá! Tenho interesse no produto: ${nomeProduto}`
  if (sku) {
    msg += ` (SKU: ${sku})`
  }
  return gerarLinkWhatsApp(numero, msg)
}

/**
 * Copia texto para a área de transferência
 */
export async function copiarParaClipboard(texto: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(texto)
    return true
  } catch {
    /** Fallback para navegadores que não suportam Clipboard API */
    const textarea = document.createElement('textarea')
    textarea.value = texto
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(textarea)
    return ok
  }
}

/**
 * Abre o WhatsApp diretamente em nova aba
 */
export function abrirWhatsApp(numero: string, mensagem: string): void {
  const url = gerarLinkWhatsApp(numero, mensagem)
  window.open(url, '_blank', 'noopener,noreferrer')
}
