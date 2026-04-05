/**
 * Vercel Serverless Function — ML Proxy
 * Túnel para realizar chamadas à API do Mercado Livre no backend para evitar CORS.
 */
import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { path, token } = req.query

  if (!path) {
    return res.status(400).json({ message: 'Caminho ausente' })
  }

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'application/json',
      'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
      'Origin': 'https://www.mercadolivre.com.br',
      'Referer': 'https://www.mercadolivre.com.br/'
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const response = await fetch(`https://api.mercadolibre.com${path}`, {
      method: req.method || 'GET',
      headers,
      // Passa o body se for POST ou PUT
      body: ['POST', 'PUT'].includes(req.method!) ? JSON.stringify(req.body) : undefined
    })

    const data = await response.json()
    return res.status(response.status).json(data)
  } catch (error: any) {
    console.error('[ML Proxy] Erro:', error)
    return res.status(500).json({ message: 'Erro na ponte com Mercado Livre' })
  }
}
