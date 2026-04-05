/**
 * Serviço de Integração Real com Mercado Livre
 * Gerencia OAuth e busca de produtos reais.
 */

const ML_API_BASE = 'https://api.mercadolibre.com'
const ML_AUTH_URL = 'https://auth.mercadolivre.com.br/authorization'

interface MLAuthConfig {
  clientId: string
  clientSecret: string
  redirectUri: string
}

/**
 * Redireciona para autenticação OAuth do Mercado Livre
 */
export function iniciarAutenticacaoML(config: MLAuthConfig): void {
  if (!config.clientId) {
    alert('Client ID do Mercado Livre não configurado!')
    return
  }

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
  })

  window.location.href = `${ML_AUTH_URL}?${params.toString()}`
}

/**
 * Troca o código de autorização por token de acesso
 */
export async function trocarCodigoPorToken(
  code: string,
  config: MLAuthConfig
): Promise<any> {
  const response = await fetch(`${ML_API_BASE}/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: config.clientId,
      client_secret: config.clientSecret,
      code,
      redirect_uri: config.redirectUri,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Erro ao trocar código por token')
  }

  return response.json()
}

/**
 * Renova o token de acesso
 */
export async function renovarToken(
  refreshToken: string,
  config: MLAuthConfig
): Promise<any> {
  const response = await fetch(`${ML_API_BASE}/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: config.clientId,
      client_secret: config.clientSecret,
      refresh_token: refreshToken,
    }),
  })

  if (!response.ok) throw new Error('Erro ao renovar token')
  return response.json()
}

/**
 * Busca IDs dos produtos do vendedor
 */
export async function buscarIdsProdutos(
  sellerId: string,
  accessToken: string,
  offset = 0,
  limit = 50
): Promise<{ ids: string[]; total: number }> {
  const response = await fetch(
    `${ML_API_BASE}/users/${sellerId}/items/search?offset=${offset}&limit=${limit}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  )

  if (!response.ok) throw new Error('Erro ao buscar IDs de produtos')
  const data = await response.json()
  return {
    ids: data.results || [],
    total: data.paging?.total || 0
  }
}

/**
 * Busca detalhes de múltiplos produtos (Multi-Get)
 */
export async function buscarDetalhesProdutos(
  ids: string[],
  accessToken: string
): Promise<any[]> {
  if (ids.length === 0) return []

  const response = await fetch(
    `${ML_API_BASE}/items?ids=${ids.join(',')}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  )

  if (!response.ok) throw new Error('Erro ao buscar detalhes dos produtos')
  const results = await response.json()
  
  // O ML retorna um array de objetos { code, body }
  return results
    .filter((r: any) => r.code === 200)
    .map((r: any) => r.body)
}

/**
 * Busca informações do vendedor (Me)
 */
export async function buscarInfoVendedor(accessToken: string): Promise<any> {
  const response = await fetch(`${ML_API_BASE}/users/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  if (!response.ok) throw new Error('Erro ao buscar info do vendedor')
  return response.json()
}
