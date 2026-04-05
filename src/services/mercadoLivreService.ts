/**
 * Serviço de Integração Real com Mercado Livre (Via Vercel Functions Proxy)
 * Gerencia OAuth e busca de produtos reais, contornando erros de CORS.
 */
import type { ProdutoML } from '@/types'

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
 * Troca o código de autorização por token de acesso (Via Backend /api/ml-auth)
 */
export async function trocarCodigoPorToken(
  code: string,
  config: MLAuthConfig
): Promise<any> {
  const response = await fetch('/api/ml-auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      code,
      clientId: config.clientId,
      clientSecret: config.clientSecret,
      redirectUri: config.redirectUri,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Erro ao trocar código por token')
  }

  return response.json()
}

/**
 * Busca IDs dos produtos do vendedor (Via Backend /api/ml-proxy)
 */
export async function buscarIdsProdutos(
  sellerId: string,
  accessToken: string,
  offset = 0,
  limit = 50
): Promise<{ ids: string[]; total: number }> {
  const path = `/users/${sellerId}/items/search?offset=${offset}&limit=${limit}`
  const response = await fetch(`/api/ml-proxy?path=${encodeURIComponent(path)}&token=${accessToken}`)

  if (!response.ok) throw new Error('Erro ao buscar IDs de produtos')
  const data = await response.json()
  return {
    ids: data.results || [],
    total: data.paging?.total || 0
  }
}

/**
 * Busca detalhes de múltiplos produtos (Via Backend /api/ml-proxy)
 */
export async function buscarDetalhesProdutos(
  ids: string[],
  accessToken: string
): Promise<any[]> {
  if (ids.length === 0) return []

  const path = `/items?ids=${ids.join(',')}`
  const response = await fetch(`/api/ml-proxy?path=${encodeURIComponent(path)}&token=${accessToken}`)

  if (!response.ok) throw new Error('Erro ao buscar detalhes dos produtos')
  const results = await response.json()
  
  return results
    .filter((r: any) => r.code === 200)
    .map((r: any) => r.body)
}

/**
 * Busca informações do vendedor (Via Backend /api/ml-proxy)
 */
export async function buscarInfoVendedor(accessToken: string): Promise<any> {
  const path = '/users/me'
  const response = await fetch(`/api/ml-proxy?path=${encodeURIComponent(path)}&token=${accessToken}`)

  if (!response.ok) throw new Error('Erro ao buscar info do vendedor')
  return response.json()
}
/**
 * Busca os 20 melhores "Deals" do dia (Mais Vendidos + Frete Grátis)
 */
export async function fetchTop20Deals(
  _accessToken?: string,
  category = 'eletronicos'
): Promise<ProdutoML[]> {
  // Chamada pública para o Mercado Livre via Proxy (Sem Token para evitar 403 se o app for restrito)
  // Utilizamos filters para garantir relevância
  const path = `/sites/MLB/search?q=${encodeURIComponent(category)}&sort=relevance&limit=20&shipping_cost=free&status=active`
  const response = await fetch(`/api/ml-proxy?path=${encodeURIComponent(path)}`)

  if (!response.ok) throw new Error('Erro ao buscar ofertas do dia')
  const data = await response.json()
  
  return (data.results || []).map((item: any) => ({
    id: item.id,
    titulo: item.title,
    preco: item.original_price || item.price,
    precoPromocional: item.price,
    linkAnuncio: item.permalink,
    imagemPrincipal: item.thumbnail.replace('-I.jpg', '-O.jpg').replace('http://', 'https://'),
    imagensSecundarias: [],
    estoque: item.available_quantity,
    categoria: item.category_id,
    marca: '',
    sku: item.id,
    status: item.status || 'active',
    variacoes: [],
    dataImportacao: new Date().toISOString(),
    vendas: item.sold_quantity || 0,
    condicao: item.condition
  }))
}

/**
 * Gera um link de afiliado "Elite" para um produto
 */
export function generateAffiliateUrl(
  originalUrl: string, 
  itemId: string,
  affId = '82693087', 
  affTag = 'kleber-san'
): string {
  // O formato que funcionou no teste: mercadolivre.com.br/social/p/{ITEM_ID}?matt_tool={ID}&matt_word={TAG}
  // Mas o link direto do produto com os parâmetros também funciona
  const baseUrl = originalUrl.split('?')[0]
  return `${baseUrl}?matt_tool=${affId}&matt_word=${affTag}&source=affiliate-factory`
}
