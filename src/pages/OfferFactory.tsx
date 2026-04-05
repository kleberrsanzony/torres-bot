import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Zap, 
  RefreshCw, 
  Send, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Play, 
  Pause,
  ExternalLink,
  Search,
  ShoppingCart
} from 'lucide-react'
import { useSettingsStore } from '@/stores/settingsStore'
import { fetchTop20Deals, generateAffiliateUrl } from '@/services/mercadoLivreService'
import { enviarMensagemOferta } from '@/services/evolutionService'
import { useHistoryStore } from '@/stores/historyStore'
import type { ProdutoML, EstiloCopy } from '@/types'

export default function OfferFactory() {
  const settings = useSettingsStore()
  const registrarNoHistorico = useHistoryStore((s) => s.adicionarRegistro)
  
  const [loading, setLoading] = useState(false)
  const [produtos, setProdutos] = useState<ProdutoML[]>([])
  const [categoria, setCategoria] = useState('eletronicos')
  
  // Controle da Fila
  const [indiceAtivo, setIndiceAtivo] = useState<number | null>(null)
  const [emExecucao, setEmExecucao] = useState(false)
  const [segundosRestantes, setSegundosRestantes] = useState(0)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const intervaloSegundos = (settings.intervaloPostagem || 30) * 60

  async function carregarOfertas() {
    if (!settings.mlToken) return
    setLoading(true)
    try {
      const deals = await fetchTop20Deals(settings.mlToken, categoria)
      setProdutos(deals)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    carregarOfertas()
  }, [settings.mlToken])

  // Lógica do Timer e Disparo
  useEffect(() => {
    if (emExecucao && segundosRestantes > 0) {
      timerRef.current = setInterval(() => {
        setSegundosRestantes(s => s - 1)
      }, 1000)
    } else if (emExecucao && segundosRestantes === 0) {
      dispararProxima()
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [emExecucao, segundosRestantes])

  async function dispararProxima() {
    const proximoIndice = indiceAtivo === null ? 0 : indiceAtivo + 1
    
    if (proximoIndice >= produtos.length) {
      setEmExecucao(false)
      setIndiceAtivo(null)
      alert('Sequência de 20 ofertas finalizada!')
      return
    }

    const produto = produtos[proximoIndice]
    setIndiceAtivo(proximoIndice)

    // Gerar Link de Afiliado
    const linkAfiliado = generateAffiliateUrl(
      produto.linkAnuncio,
      produto.id,
      settings.mlAffiliateId,
      settings.mlAffiliateTag
    )

    // Mensagem Formatada
    const mensagem = `🔥 *OFERTA RELÂMPAGO DO DIA!* 🔥\n\n*${produto.titulo}*\n\n💰 De: ~R$ ${produto.preco.toFixed(2)}~\n🚀 *POR APENAS: R$ ${produto.precoPromocional?.toFixed(2)}*\n\n✅ FRETE GRÁTIS ATIVO!\n⚠️ Link com estoque limitado!\n\n🛒 *COMPRE AQUI:* ${linkAfiliado}\n\n#mercadoLivre #oferta #afiliado`

    try {
      await enviarMensagemOferta(
        settings.evoUrl || '',
        settings.evoApiKey || '',
        settings.evoInstanceName || '',
        settings.evoGroupJid || '',
        {
          id: produto.id,
          nomeProduto: produto.titulo,
          sku: produto.sku,
          precoDe: produto.preco,
          precoPor: produto.precoPromocional || produto.preco,
          linkMercadoLivre: linkAfiliado,
          numeroWhatsApp: settings.numeroWhatsApp,
          linkGrupo: settings.linkGrupo,
          descricao: '',
          urgencia: 'Alta',
          imagem: produto.imagemPrincipal,
          copyGerada: mensagem,
          estiloCopy: 'vendedor' as EstiloCopy,
          status: 'enviada',
          favorita: false,
          dataCriacao: new Date().toISOString(),
          dataAtualizacao: new Date().toISOString()
        }
      )
      
      registrarNoHistorico({
        id: crypto.randomUUID(),
        ofertaId: produto.id,
        produtoNome: produto.titulo,
        copyUsada: mensagem,
        data: new Date().toISOString(),
        acao: 'enviada'
      })

      // Reiniciar Timer se não for o último
      if (proximoIndice < produtos.length - 1) {
        setSegundosRestantes(intervaloSegundos)
      } else {
        setEmExecucao(false)
      }
    } catch (err) {
      console.error('Erro no disparo:', err)
      setEmExecucao(false)
    }
  }

  function toggleExecucao() {
    if (produtos.length === 0) return
    if (!emExecucao) {
      setEmExecucao(true)
      if (indiceAtivo === null) {
        dispararProxima()
      }
    } else {
      setEmExecucao(false)
    }
  }

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60)
    const secs = s % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-[1200px] mx-auto pb-32 space-y-8"
    >
      {/* Header Premium */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-white">
            Fábrica de <span className="text-[var(--color-accent)]">Ofertas 20/DIA</span>
          </h1>
          <p className="text-sm font-medium text-[var(--color-text-muted)] uppercase tracking-widest leading-none">
            Motor Inteligente & Disparo Automático (Intervalo: {settings.intervaloPostagem}m)
          </p>
        </div>

        <div className="flex gap-4">
           <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
              <select 
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                className="pl-12 pr-8 py-3 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] text-sm font-bold text-white focus:border-[var(--color-accent)] appearance-none"
              >
                <option value="eletronicos">Eletrônicos</option>
                <option value="ferramentas">Ferramentas</option>
                <option value="casa">Casa & Cozinha</option>
                <option value="gamer">Gamer</option>
                <option value="smartphones">Celulares</option>
              </select>
           </div>
           <button 
             onClick={carregarOfertas}
             disabled={loading}
             className="p-3 rounded-2xl bg-[var(--color-bg-primary)] border border-[var(--color-border)] text-white hover:text-[var(--color-accent)] transition-all"
           >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
           </button>
        </div>
      </div>

      {/* Control Card */}
      <motion.div 
        layout
        className={`p-8 rounded-[2.5rem] border-2 transition-all shadow-2xl relative overflow-hidden ${
          emExecucao ? 'border-emerald-500 bg-emerald-500/5' : 'border-[var(--color-border)] bg-[var(--color-surface)]'
        }`}
      >
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
           <div className="flex items-center gap-6">
              <div className={`w-20 h-20 rounded-3xl flex items-center justify-center shadow-2xl ${
                emExecucao ? 'bg-emerald-500 text-black' : 'bg-[var(--color-accent)] text-black'
              }`}>
                 {emExecucao ? <Clock className="w-10 h-10 animate-pulse" /> : <Zap className="w-10 h-10" />}
              </div>
              <div className="space-y-1">
                 <h2 className="text-2xl font-black text-white">Status da Caldeira</h2>
                 <p className="text-sm font-bold text-[var(--color-text-muted)] flex items-center gap-2">
                    {emExecucao ? (
                      <>
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                        DISPARANDO AGORA: {indiceAtivo !== null ? indiceAtivo + 1 : 0} / {produtos.length}
                      </>
                    ) : (
                      'MOTOR EM STANDBY - AGUARDANDO COMANDO'
                    )}
                 </p>
              </div>
           </div>

           <div className="flex items-center gap-4">
              {emExecucao && (
                <div className="px-6 py-4 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 text-center">
                   <div className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Próxima em</div>
                   <div className="text-2xl font-black text-emerald-500 font-mono">{formatTime(segundosRestantes)}</div>
                </div>
              )}

              <button 
                onClick={toggleExecucao}
                className={`flex items-center gap-3 px-10 py-5 rounded-3xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-2xl ${
                  emExecucao ? 'bg-amber-500 text-black hover:scale-105' : 'bg-emerald-500 text-black hover:scale-105 active:scale-95'
                }`}
              >
                {emExecucao ? <><Pause className="w-5 h-5 fill-current" /> Pausar Máquina</> : <><Play className="w-5 h-5 fill-current" /> Iniciar 20/DIA</>}
              </button>
           </div>
        </div>

        {/* Barra de Progresso */}
        <div className="absolute bottom-0 left-0 h-1.5 bg-emerald-500 transition-all duration-1000" style={{ width: `${((indiceAtivo ?? -1) + 1) / produtos.length * 100}%` }} />
      </motion.div>

      {/* Grid de Ofertas Planejadas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <AnimatePresence>
          {produtos.map((p, idx) => (
            <motion.div
              layout
              key={p.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`group relative p-6 rounded-[2rem] border-2 transition-all ${
                indiceAtivo === idx ? 'border-emerald-500 bg-emerald-500/10' : 
                (indiceAtivo !== null && idx < indiceAtivo) ? 'border-[var(--color-border)] opacity-40' :
                'border-[var(--color-border)] bg-[var(--color-surface)]/40 hover:border-white/20'
              }`}
            >
              <div className="absolute top-4 right-4 z-10 flex gap-2">
                 <div className="px-2 py-1 rounded-lg bg-black/60 backdrop-blur-md text-[10px] font-black text-[var(--color-accent)] border border-[var(--color-accent)]/30">
                    #{idx + 1}
                 </div>
              </div>

              <div className="aspect-square rounded-2xl overflow-hidden mb-4 bg-white/5 relative">
                 <img src={p.imagemPrincipal} alt={p.titulo} className="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform" />
                 {indiceAtivo === idx && (
                    <div className="absolute inset-0 bg-emerald-500/20 flex items-center justify-center">
                       <Send className="w-10 h-10 text-white animate-bounce" />
                    </div>
                 )}
              </div>

              <div className="space-y-3">
                 <h4 className="text-xs font-black text-white line-clamp-2 leading-tight h-8 uppercase tracking-tighter">
                    {p.titulo}
                 </h4>
                 
                 <div className="space-y-1">
                    <div className="text-[10px] font-bold text-red-500 line-through opacity-60">R$ {p.preco.toFixed(2)}</div>
                    <div className="text-lg font-black text-white">R$ {p.precoPromocional?.toFixed(2)}</div>
                 </div>

                 <div className="pt-2 flex items-center justify-between border-t border-white/5">
                    <div className="flex items-center gap-1.5">
                       <ShoppingCart className="w-3 h-3 text-emerald-500" />
                       <span className="text-[10px] font-black text-emerald-500">FRETE GRÁTIS</span>
                    </div>
                    {indiceAtivo !== null && idx < indiceAtivo ? (
                       <CheckCircle className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <div className="w-4 h-4 rounded-sm border border-white/20" />
                    )}
                 </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
           <RefreshCw className="w-12 h-12 text-[var(--color-accent)] animate-spin" />
           <p className="text-xs font-black text-[var(--color-accent)] uppercase tracking-[0.4em]">Sintonizando melhores ofertas...</p>
        </div>
      )}
    </motion.div>
  )
}
