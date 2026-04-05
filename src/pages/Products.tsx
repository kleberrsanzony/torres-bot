import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Filter,
  RefreshCw,
  ExternalLink,
  ShoppingCart,
  Package,
  Loader2,
  SlidersHorizontal,
  X,
  Zap,
} from 'lucide-react'
import { useProductStore } from '@/stores/productStore'
import { categoriasMock } from '@/data/mockProducts'
import { formatarPreco, calcularDesconto } from '@/lib/utils'
import type { ProdutoML } from '@/types'

export default function Products() {
  const navigate = useNavigate()
  const {
    produtos,
    filtros,
    carregando,
    importarProdutos,
    setFiltros,
    limparFiltros,
    produtosFiltrados,
  } = useProductStore()

  const [mostrarFiltros, setMostrarFiltros] = useState(false)

  useEffect(() => {
    if (produtos.length === 0 && !carregando) {
      importarProdutos()
    }
  }, [])

  const listaProdutos = produtosFiltrados()
  const temFiltrosAtivos =
    filtros.busca !== '' ||
    filtros.categoria !== 'todos' ||
    filtros.estoque !== 'todos' ||
    filtros.status !== 'todos'

  function importarParaOferta(produto: ProdutoML) {
    navigate('/nova-oferta', { state: { produto } })
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  }

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-6 max-w-[1600px] mx-auto pb-20"
    >
      {/* Header Premium */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-[var(--color-text-primary)] tracking-tight">
            Seu <span className="text-[var(--color-accent)]">Estoque</span> Real
          </h1>
          <p className="text-sm font-medium text-[var(--color-text-secondary)]">
            Total de <span className="text-[var(--color-text-primary)] font-bold">{listaProdutos.length}</span> itens sincronizados do Mercado Livre.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
            className={`
              flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold
              border transition-all duration-300
              ${
                mostrarFiltros || temFiltrosAtivos
                  ? 'border-[var(--color-accent)] bg-[var(--color-accent-soft)] text-[var(--color-accent)]'
                  : 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:border-[var(--color-text-muted)]'
              }
            `}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filtros
            {temFiltrosAtivos && (
              <span className="w-2 h-2 rounded-full bg-[var(--color-accent)] animate-pulse" />
            )}
          </button>

          <button
            onClick={importarProdutos}
            disabled={carregando}
            className="
              flex items-center gap-2 px-5 py-3 rounded-xl text-sm
              bg-[var(--color-gradient-gold)] text-[var(--color-text-inverse)]
              font-black shadow-lg hover:scale-105 active:scale-95
              disabled:opacity-50 transition-all duration-300
            "
          >
            {carregando ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            Sincronizar Loja
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
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]/50 backdrop-blur-sm p-6 space-y-6 mb-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black uppercase tracking-widest text-[var(--color-text-primary)] flex items-center gap-2">
                  <Filter className="w-4 h-4 text-[var(--color-accent)]" />
                  Refinar Busca
                </h3>
                {temFiltrosAtivos && (
                  <button
                    onClick={limparFiltros}
                    className="text-xs font-bold text-[var(--color-accent)] hover:text-[var(--color-accent-light)] flex items-center gap-1 transition-colors"
                  >
                    <X className="w-3 h-3" /> Resetar tudo
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="relative group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)] group-focus-within:text-[var(--color-accent)] transition-colors" />
                  <input
                    type="text"
                    value={filtros.busca}
                    onChange={(e) => setFiltros({ busca: e.target.value })}
                    placeholder="Nome ou SKU..."
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-[var(--color-bg-primary)] border border-[var(--color-border)] text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent)] transition-all"
                  />
                </div>

                <select
                  value={filtros.categoria}
                  onChange={(e) => setFiltros({ categoria: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-[var(--color-bg-primary)] border border-[var(--color-border)] text-sm text-[var(--color-text-primary)] focus:border-[var(--color-accent)]"
                >
                  <option value="todos">Categorias</option>
                  {categoriasMock.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>

                <select
                  value={filtros.estoque}
                  onChange={(e) => setFiltros({ estoque: e.target.value as any })}
                  className="w-full px-4 py-3 rounded-xl bg-[var(--color-bg-primary)] border border-[var(--color-border)] text-sm text-[var(--color-text-primary)] focus:border-[var(--color-accent)]"
                >
                  <option value="todos">Estoque</option>
                  <option value="disponivel">Em estoque</option>
                  <option value="esgotado">Esgotados</option>
                </select>

                <select
                  value={filtros.status}
                  onChange={(e) => setFiltros({ status: e.target.value as any })}
                  className="w-full px-4 py-3 rounded-xl bg-[var(--color-bg-primary)] border border-[var(--color-border)] text-sm text-[var(--color-text-primary)] focus:border-[var(--color-accent)]"
                >
                  <option value="todos">Status Anúncio</option>
                  <option value="active">Ativos</option>
                  <option value="paused">Pausados</option>
                </select>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid de Produtos Premium */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
        {carregando ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] aspect-[4/5] animate-pulse" />
          ))
        ) : (
          listaProdutos.map((produto) => {
            const desconto = calcularDesconto(produto.preco, produto.precoPromocional || produto.preco)
            
            return (
              <motion.div
                key={produto.id}
                variants={itemVariants}
                whileHover={{ y: -8 }}
                className="group relative rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden hover:border-[var(--color-accent)] hover:shadow-2xl transition-all duration-500"
              >
                {/* Imagem com Overlay */}
                <div className="relative aspect-square overflow-hidden bg-black/40">
                  <img
                    src={produto.imagemPrincipal}
                    alt={produto.titulo}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    loading="lazy"
                  />
                  
                  {/* Badges Flutuantes */}
                  <div className="absolute top-3 left-3 flex flex-col gap-2">
                    <span className={`
                      px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider
                      ${produto.status === 'active' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white shadow-lg'}
                    `}>
                      {produto.status === 'active' ? 'Ativo' : 'Pausado'}
                    </span>
                    {desconto > 0 && (
                      <span className="bg-[var(--color-accent)] text-[var(--color-text-inverse)] px-2 py-1 rounded-lg text-[10px] font-black uppercase">
                        {desconto}% OFF
                      </span>
                    )}
                  </div>

                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 flex flex-col justify-end">
                     <button
                        onClick={() => importarParaOferta(produto)}
                        className="w-full py-3 bg-[var(--color-accent)] text-[var(--color-text-inverse)] rounded-xl font-black text-xs uppercase tracking-widest shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300"
                     >
                        Gerar Oferta
                     </button>
                  </div>
                </div>

                {/* Conteúdo */}
                <div className="p-5 space-y-4">
                  <div>
                    <p className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-widest mb-1">
                      {produto.sku || 'Sem SKU'}
                    </p>
                    <h3 className="text-sm font-bold text-[var(--color-text-primary)] line-clamp-2 leading-snug group-hover:text-[var(--color-accent)] transition-colors h-10">
                      {produto.titulo}
                    </h3>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      {produto.precoPromocional && (
                        <span className="text-[10px] line-through text-[var(--color-text-muted)] font-bold decoration-amber-500/50">
                          {formatarPreco(produto.preco)}
                        </span>
                      )}
                      <span className="text-xl font-black text-[var(--color-text-primary)]">
                        {formatarPreco(produto.precoPromocional || produto.preco)}
                      </span>
                    </div>
                    
                    <a 
                      href={produto.linkAnuncio} 
                      target="_blank" 
                      className="p-2 rounded-xl bg-[var(--color-surface-hover)] text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] transition-colors"
                    >
                      <ExternalLink className="w-5 h-5" />
                    </a>
                  </div>

                  <div className="pt-4 border-t border-[var(--color-border)] flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className={`w-2 h-2 rounded-full ${produto.estoque > 0 ? 'bg-emerald-500' : 'bg-red-500'}`} />
                      <span className="text-[10px] font-black uppercase text-[var(--color-text-secondary)]">
                        Stock: {produto.estoque} un
                      </span>
                    </div>
                    <Zap className="w-4 h-4 text-[var(--color-accent)] opacity-20" />
                  </div>
                </div>
              </motion.div>
            )
          })
        )}
      </div>

      {/* State Vazio */}
      {!carregando && listaProdutos.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
          <div className="w-20 h-20 rounded-3xl bg-[var(--color-surface)] border border-dashed border-[var(--color-border)] flex items-center justify-center">
            <Package className="w-10 h-10 text-[var(--color-text-muted)]" />
          </div>
          <h3 className="text-xl font-bold text-[var(--color-text-primary)]">Nenhum tesouro encontrado</h3>
          <p className="text-sm text-[var(--color-text-secondary)] max-w-xs">
            Refine seus filtros ou realize uma nova sincronização com o Mercado Livre.
          </p>
          <button 
            onClick={limparFiltros}
            className="text-[var(--color-accent)] font-bold text-sm underline underline-offset-8"
          >
            Limpar todos os filtros
          </button>
        </div>
      )}
    </motion.div>
  )
}
