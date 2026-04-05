/**
 * Serviço de Integração com Evolution API v2
 * Automação de envio de mensagens via WhatsApp.
 */

interface EvolutionSendMediaParams {
  url: string
  apiKey: string
  instanceName: string
  remoteJid: string
  mediaUrl: string
  caption: string
}

/**
 * Envia uma mensagem de mídia (imagem) com legenda (copy) juntas.
 */
export async function enviarMensagemOferta(params: EvolutionSendMediaParams): Promise<any> {
  const { url, apiKey, instanceName, remoteJid, mediaUrl, caption } = params

  if (!url || !apiKey || !instanceName || !remoteJid) {
    throw new Error('Configurações da Evolution API incompletas!')
  }

  // Limpa a URL se tiver barra no final
  const baseUrl = url.endsWith('/') ? url.slice(0, -1) : url
  
  const endpoint = `${baseUrl}/message/sendMedia/${instanceName}`

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': apiKey
    },
    body: JSON.stringify({
      number: remoteJid,
      media: mediaUrl,
      mediaType: 'image',
      caption: caption,
      delay: 1200 // Pequeno delay humano
    })
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Erro ao enviar mensagem via Evolution API')
  }

  return response.json()
}

/**
 * Testa a conexão com a instância
 */
export async function testarConexaoEvolution(url: string, apiKey: string, instanceName: string): Promise<boolean> {
  try {
    const baseUrl = url.endsWith('/') ? url.slice(0, -1) : url
    const response = await fetch(`${baseUrl}/instance/connectionState/${instanceName}`, {
      headers: { 'apikey': apiKey }
    })
    
    if (!response.ok) return false
    const data = await response.json()
    return data.instance.state === 'open'
  } catch {
    return false
  }
}
