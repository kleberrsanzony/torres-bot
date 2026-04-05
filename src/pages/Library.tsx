import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Filter,
  Star,
  Copy,
  Trash2,
  Edit3,
  Archive,
  ExternalLink,
  MessageSquare,
  FileText,
  Heart,
  MoreVertical,
  X,
  SlidersHorizontal,
  Clock,
  Zap,
} from 'lucide-react'
import { useOfferStore } from '@/stores/offerStore'
import { useHistoryStore } from '@/stores/historyStore'
import { formatarPreco, formatarData, calcularDesconto } from '@/lib/utils'
import { copiarParaClipboard, abrirWhatsApp } from '@/lib/whatsappLink'
import type { StatusOferta } from '@/types'

export default function Library() {
  const navigate = useNavigate()
  const {
    filtros,
    setFiltros,
    limparFiltros,
    ofertasFiltradas,
    excluirOferta,
    duplicarOferta,
    alternarFavorita,
    alterarStatus,
  } = useOfferStore()
  const adicionarRegistro = useHistoryStore((s) => s.adicionarRegistro)

  const [menuAberto, setMenuAberto] = useState<string | null>(null)
  const [mostrarFiltros, setMostrarFiltros] = useState(false)

  const ofertas = ofertasFiltradas()
  const temFiltros = filtros.busca !== '' || filtros.status !== 'todos'

  async function handleCopiar(copy: string) {
    await copiarParaClipboard(copy)
  }

  function handleExcluir(id: string, nome: string) {
    if (!confirm(`Deseja realmente excluir a oferta "${nome}"?`)) return
    excluirOferta(id)
    adicionarRegistro({
      ofertaId: id,
      produtoNome: nome,
      copyUsada: '',
      acao: 'excluida',
    })
    setMenuAberto(null)
  }

  function handleDuplicar(id: string) {
    const copia = duplicarOferta(id)
    if (copia) {
      adicionarRegistro({
        ofertaId: copia.id,
        produtoNome: copia.nomeProduto,
        copyUsada: copia.copyGerada,
        acao: 'duplicada',
      })
    }
    setMenuAberto(null)
  }

  function handleArquivar(id: string, nome: string) {
    alterarStatus(id, 'arquivada')
    adicionarRegistro({
      ofertaId: id,
      produtoNome: nome,
      copyUsada: '',
      acao: 'arquivada',
    })
    setMenuAberto(null)
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
  }

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 }
  }

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-6 max-w-[1200px] mx-auto pb-20"
    >
      {/* Header Premium */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-[var(--color-text-primary)]">
            Sua <span className="text-[var(--color-accent)]">Biblioteca</span> Deep
          </h1>
          <p className="text-sm font-medium text-[var(--color-text-muted)] uppercase tracking-widest leading-none">
            {ofertas.length} Ofertas de impacto registradas
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
            className={`
              flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold border transition-all
              ${mostrarFiltros || temFiltros 
                ? 'border-[var(--color-accent)] bg-[var(--color-accent-soft)] text-[var(--color-accent)]' 
                : 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:border-[var(--color-text-muted)]'}
            `}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filtrar
          </button>
          <button
            onClick={() => navigate('/nova-oferta')}
            className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-black bg-[var(--color-gradient-gold)] text-black shadow-lg hover:scale-105 active:scale-95 transition-all"
          >
            <Zap className="w-4 h-4 fill-black" />
            Nova Oferta
          </button>
        </div>
      </div>

      {/* Painel de Filtros Glass */}
      <AnimatePresence>
        {mostrarFiltros && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]/50 backdrop-blur-sm p-6 space-y-4 mb-4">
              <div className="flex items-center justify-between">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)]">Refinar Biblioteca</h4>
                {temFiltros && (
                  <button onClick={limparFiltros} className="text-[10px] font-black uppercase text-[var(--color-accent)] border-b border-[var(--color-accent)]">Resetar</button>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
                  <input
                    type="text"
                    value={filtros.busca}
                    onChange={(e) => setFiltros({ busca: e.target.value })}
                    placeholder="Buscar oferta..."
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-[var(--color-bg-primary)] border border-[var(--color-border)] text-sm text-white focus:border-[var(--color-accent)] transition-all"
                  />
                </div>
                <select
                  value={filtros.status}
                  onChange={(e) => setFiltros({ status: e.target.value as StatusOferta | 'todos' })}
                  className="w-full px-4 py-3 rounded-xl bg-[var(--color-bg-primary)] border border-[var(--color-border)] text-sm text-white focus:border-[var(--color-accent)] transition-all"
                >
                  <option value="todos">Status: Todos</option>
                  <option value="rascunho">Rascunho</option>
                  <option value="pronta">Pronta</option>
                  <option value="enviada">Enviada</option>
                  <option value="arquivada">Arquivada</option>
                </select>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lista de Cards Premium */}
      <div className="grid gap-4">
        {ofertas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center space-y-4">
             <div className="w-20 h-20 rounded-3xl bg-[var(--color-surface)] border border-dashed border-[var(--color-border)] flex items-center justify-center">
                <FileText className="w-10 h-10 text-[var(--color-text-muted)]" />
             </div>
             <p className="text-sm font-bold text-[var(--color-text-secondary)]">Sua biblioteca está um deserto...<br/>Que tal criar algo grande hoje?</p>
             <button onClick={() => navigate('/nova-oferta')} className="text-[var(--color-accent)] font-black text-xs uppercase tracking-widest hover:underline underline-offset-8 transition-all">Começar Agora</button>
          </div>
        ) : (
          ofertas.map((oferta) => {
            const desconto = calcularDesconto(oferta.precoDe, oferta.precoPor)
            return (
              <motion.div
                key={oferta.id}
                variants={itemVariants}
                whileHover={{ x: 4 }}
                className="group relative flex flex-col md:flex-row gap-5 p-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-accent)] hover:shadow-[0_0_30px_rgba(212,175,55,0.05)] transition-all duration-300"
              >
                {/* Thumb */}
                <div className="relative w-full md:w-32 aspect-square md:aspect-auto md:h-32 rounded-xl overflow-hidden bg-black/40 flex-shrink-0">
                  {oferta.imagem && (
                    <img
                      src={oferta.imagem}
                      alt={oferta.nomeProduto}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  )}
                  {desconto > 0 && (
                    <div className="absolute top-2 left-2 bg-[var(--color-accent)] text-black text-[9px] font-black px-1.5 py-0.5 rounded-md">
                      {desconto}% OFF
                    </div>
                  )}
                </div>

                {/* Body */}
                <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <h4 className="text-base font-black text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)] transition-colors line-clamp-1">
                          {oferta.nomeProduto}
                        </h4>
                        <div className="flex items-center gap-3">
                          <span className="text-xl font-black text-white">{formatarPreco(oferta.precoPor)}</span>
                          <span className="text-xs line-through text-[var(--color-text-muted)] font-bold">{formatarPreco(oferta.precoDe)}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => alternarFavorita(oferta.id)}
                          className={`p-2 rounded-xl transition-all ${oferta.favorita ? 'bg-amber-500/10 text-amber-500' : 'bg-[var(--color-bg-primary)] text-[var(--color-text-muted)] hover:text-white'}`}
                        >
                          <Star className={`w-5 h-5 ${oferta.favorita ? 'fill-current' : ''}`} />
                        </button>
                        <span className={`
                           px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest
                           ${oferta.status === 'enviada' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-gray-500/10 text-gray-400'}
                        `}>
                          {oferta.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="mt-4 pt-4 border-t border-[var(--color-border)] flex flex-wrap items-center gap-3">
                    <button
                      onClick={() => handleCopiar(oferta.copyGerada)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest bg-[var(--color-bg-primary)] text-[var(--color-text-muted)] hover:text-[var(--color-accent)] hover:border-[var(--color-accent)] border border-transparent transition-all"
                    >
                      <Copy className="w-3 h-3" /> Copiar
                    </button>
                    <button
                      onClick={() => oferta.numeroWhatsApp && abrirWhatsApp(oferta.numeroWhatsApp, oferta.copyGerada)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest bg-[#25d366]/10 text-[#25d366] hover:bg-[#25d366] hover:text-black transition-all"
                    >
                      <MessageSquare className="w-3 h-3" /> WhatsApp
                    </button>
                    
                    <div className="flex-1" />

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                       <button onClick={() => navigate('/nova-oferta', { state: { produto: { id: oferta.produtoId, titulo: oferta.nomeProduto, sku: oferta.sku, preco: oferta.precoDe, precoPromocional: oferta.precoPor, imagemPrincipal: oferta.imagem } as any } })} className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-colors"><Edit3 className="w-4 h-4"/></button>
                       <button onClick={() => handleDuplicar(oferta.id)} className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-colors"><Copy className="w-4 h-4"/></button>
                       <button onClick={() => handleArquivar(oferta.id, oferta.nomeProduto)} className="p-2 text-[var(--color-text-muted)] hover:text-white transition-colors"><Archive className="w-4 h-4"/></button>
                       <button onClick={() => handleExcluir(oferta.id, oferta.nomeProduto)} className="p-2 text-red-500/50 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4"/></button>
                    </div>

                    <div className="flex items-center gap-1.5 text-[9px] font-bold text-[var(--color-text-muted)] uppercase">
                       <Clock className="w-3 h-3"/>
                       {formatarData(oferta.dataCriacao)}
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })
        )}
      </div>
    </motion.div>
  )
}
