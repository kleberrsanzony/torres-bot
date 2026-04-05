/**
 * Página de Callback do Mercado Livre
 * Captura o code da URL e o troca por tokens.
 */
import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { useSettingsStore } from '@/stores/settingsStore'
import { useProductStore } from '@/stores/productStore'
import { trocarCodigoPorToken, buscarInfoVendedor } from '@/services/mercadoLivreService'

export default function MLCallback() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { atualizarConfig, mlClientId, mlClientSecret, mlRedirectUri } = useSettingsStore()
  const { sincronizarProdutosReais } = useProductStore()

  const [status, setStatus] = useState<'processando' | 'sucesso' | 'erro'>('processando')
  const [mensagem, setMensagem] = useState('Finalizando integração com Mercado Livre...')

  useEffect(() => {
    const code = searchParams.get('code')
    if (!code) {
      setStatus('erro')
      setMensagem('Código de autorização não encontrado na URL.')
      return
    }

    async function processarCallback() {
      try {
        const config = {
          clientId: mlClientId || '',
          clientSecret: mlClientSecret || '',
          redirectUri: mlRedirectUri || ''
        }
        
        // 1. Trocar código pelo token
        const authData = await trocarCodigoPorToken(code!, config)
        
        // 2. Buscar informações do vendedor
        const sellerInfo = await buscarInfoVendedor(authData.access_token)
        
        // 3. Salvar tokens e dados do vendedor na store
        atualizarConfig({
          mlConectado: true,
          mlToken: authData.access_token,
          mlRefreshToken: authData.refresh_token,
          mlSellerId: sellerInfo.id.toString(),
          mlNomeLoja: sellerInfo.nickname,
          mlUltimaSincronizacao: new Date().toISOString()
        })

        // 4. Iniciar Sincronização Automática (conforme solicitado pelo usuário)
        setStatus('sucesso')
        setMensagem('Conectado com sucesso! Sincronizando seus produtos...')
        
        // Chamar sync real
        await sincronizarProdutosReais()

        // 5. Redirecionar para configurações após um delay
        setTimeout(() => {
          navigate('/configuracoes')
        }, 2000)

      } catch (error: any) {
        console.error('[ML Callback] Erro:', error)
        setStatus('erro')
        setMensagem(error.message || 'Falha ao autenticar com Mercado Livre.')
      }
    }

    processarCallback()
  }, [])

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 animate-fade-in">
      <div className={`p-4 rounded-full ${
        status === 'processando' ? 'bg-[var(--color-accent-soft)]' :
        status === 'sucesso' ? 'bg-[var(--color-success-soft)]' :
        'bg-[var(--color-danger-soft)]'
      }`}>
        {status === 'processando' && <Loader2 className="w-12 h-12 text-[var(--color-accent)] animate-spin" />}
        {status === 'sucesso' && <CheckCircle className="w-12 h-12 text-[var(--color-accent)]" />}
        {status === 'erro' && <AlertCircle className="w-12 h-12 text-[var(--color-danger)]" />}
      </div>

      <div className="text-center">
        <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-1">
          {status === 'processando' ? 'Autenticando...' : 
           status === 'sucesso' ? 'Sucesso!' : 'Algo deu errado'}
        </h2>
        <p className="text-[var(--color-text-secondary)]">{mensagem}</p>
      </div>

      {status === 'erro' && (
        <button 
          onClick={() => navigate('/configuracoes')}
          className="mt-4 px-6 py-2 bg-[var(--color-accent)] text-white rounded-lg font-bold"
        >
          Voltar para Configurações
        </button>
      )}
    </div>
  )
}
