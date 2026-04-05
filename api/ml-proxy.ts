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
      'User-Agent': 'TorresBot/1.0 (https://torres-bot.vercel.app)'
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
