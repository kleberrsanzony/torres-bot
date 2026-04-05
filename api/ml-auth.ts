/**
 * Vercel Serverless Function — ML Auth
 * Realiza a troca do authorization_code por access_token no backend para evitar CORS e proteger segredos.
 */
import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método não permitido' })
  }

  const { code, clientId, clientSecret, redirectUri } = req.body

  if (!code || !clientId || !clientSecret || !redirectUri) {
    return res.status(400).json({ message: 'Parâmetros incompletos' })
  }

  try {
    const response = await fetch('https://api.mercadolibre.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri,
      }),
    })

    const data = await response.json()
    
    if (!response.ok) {
      return res.status(response.status).json(data)
    }

    return res.status(200).json(data)
  } catch (error: any) {
    console.error('[API ML Auth Hub] Erro:', error)
    return res.status(500).json({ message: 'Erro interno ao processar autenticação' })
  }
}
