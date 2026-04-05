import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Loader2, CheckCircle, AlertCircle, ArrowLeft, Zap } from 'lucide-react'
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
      setMensagem('Código de autorização não encontrado.')
      return
    }

    async function processarCallback() {
      try {
        const config = {
          clientId: mlClientId || '',
          clientSecret: mlClientSecret || '',
          redirectUri: mlRedirectUri || ''
        }
        
        const authData = await trocarCodigoPorToken(code!, config)
        const sellerInfo = await buscarInfoVendedor(authData.access_token)
        
        atualizarConfig({
          mlConectado: true,
          mlToken: authData.access_token,
          mlRefreshToken: authData.refresh_token,
          mlSellerId: sellerInfo.id.toString(),
          mlNomeLoja: sellerInfo.nickname,
          mlUltimaSincronizacao: new Date().toISOString()
        })

        setStatus('sucesso')
        setMensagem('Conexão estabelecida! Sincronizando seu acervo...')
        
        await sincronizarProdutosReais()

        setTimeout(() => {
          navigate('/configuracoes')
        }, 2000)

      } catch (error: any) {
        console.error('[ML Callback] Erro:', error)
        setStatus('erro')
        setMensagem(error.message || 'Falha na autenticação.')
      }
    }

    processarCallback()
  }, [])

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center min-h-[70vh] px-4"
    >
      <div className="relative group">
         {/* Decor Circle */}
         <div className={`absolute inset-0 blur-3xl opacity-20 group-hover:opacity-40 transition-opacity ${
            status === 'processando' ? 'bg-[var(--color-accent)]' :
            status === 'sucesso' ? 'bg-emerald-500' :
            'bg-red-500'
         }`} />
         
         <div className={`relative z-10 w-24 h-24 rounded-[2rem] border border-[var(--color-border)] bg-[var(--color-surface)] flex items-center justify-center shadow-2xl transition-all ${
            status === 'sucesso' ? 'border-emerald-500/50' : 
            status === 'erro' ? 'border-red-500/50' : 
            'border-[var(--color-accent)]'
         }`}>
           {status === 'processando' && <Loader2 className="w-10 h-10 text-[var(--color-accent)] animate-spin" />}
           {status === 'sucesso' && <Zap className="w-10 h-10 text-emerald-500 fill-emerald-500" />}
           {status === 'erro' && <AlertCircle className="w-10 h-10 text-red-500" />}
         </div>
      </div>

      <div className="mt-8 text-center space-y-3">
        <h2 className="text-3xl font-black text-white tracking-tight">
          {status === 'processando' ? 'Processando <span class="text-[var(--color-accent)]">DNA</span>' : 
           status === 'sucesso' ? 'Acesso <span class="text-emerald-500">Concedido</span>' : 'Acesso <span class="text-red-500">Negado</span>'}
        </h2>
        <p className="text-sm font-medium text-[var(--color-text-muted)] uppercase tracking-[0.2em] max-w-xs mx-auto">
          {mensagem}
        </p>
      </div>

      {status === 'sucesso' && (
         <motion.div 
           initial={{ width: 0 }}
           animate={{ width: 200 }}
           className="h-1 bg-[var(--color-accent)] rounded-full mt-6 shadow-[0_0_15px_rgba(212,175,55,0.4)]"
         />
      )}

      {status === 'erro' && (
        <button 
          onClick={() => navigate('/configuracoes')}
          className="mt-10 flex items-center gap-2 px-8 py-4 bg-[var(--color-surface)] border border-[var(--color-border)] text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:border-white transition-all shadow-xl"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar e Revisar
        </button>
      )}
    </motion.div>
  )
}
