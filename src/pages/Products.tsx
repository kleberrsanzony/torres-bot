/**
 * Produtos — Listagem de produtos da minha loja ML
 * Grid com filtros, importação para oferta, ações.
 */
import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
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

  /** Importar automaticamente se não há produtos */
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

  /** Importar produto para formulário de oferta */
  function importarParaOferta(produto: ProdutoML) {
    navigate('/nova-oferta', { state: { produto } })
  }

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
            Produtos da Minha Loja
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            {listaProdutos.length} produto{listaProdutos.length !== 1 ? 's' : ''} encontrado{listaProdutos.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
            className={`
              flex items-center gap-2 px-3 py-2 rounded-lg text-sm
              border transition-all
              ${
                mostrarFiltros || temFiltrosAtivos
                  ? 'border-[var(--color-accent)] bg-[var(--color-accent-soft)] text-[var(--color-accent)]'
                  : 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]'
              }
            `}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filtros
            {temFiltrosAtivos && (
              <span className="w-2 h-2 rounded-full bg-[var(--color-accent)]" />
            )}
          </button>
          <button
            onClick={importarProdutos}
            disabled={carregando}
            className="
              flex items-center gap-2 px-4 py-2 rounded-lg text-sm
              bg-[var(--color-accent)] text-[var(--color-text-inverse)]
              font-semibold hover:bg-[var(--color-accent-light)]
              disabled:opacity-50 transition-all
            "
          >
            {carregando ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            Sincronizar
          </button>
        </div>
      </div>

      {/* Barra de filtros */}
      {mostrarFiltros && (
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 animate-slide-in-up space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[var(--color-text-primary)] flex items-center gap-2">
              <Filter className="w-4 h-4 text-[var(--color-accent)]" />
              Filtros
            </h3>
            {temFiltrosAtivos && (
              <button
                onClick={limparFiltros}
                className="text-xs text-[var(--color-accent)] hover:underline flex items-center gap-1"
              >
                <X className="w-3 h-3" /> Limpar
              </button>
            )}
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Busca */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-secondary)]" />
              <input
                type="text"
                value={filtros.busca}
                onChange={(e) => setFiltros({ busca: e.target.value })}
                placeholder="Buscar por nome ou SKU..."
                className="
                  w-full pl-9 pr-3 py-2 rounded-lg text-sm
                  bg-[var(--color-bg-secondary)] border border-[var(--color-border)]
                  text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)]
                  focus:outline-none focus:border-[var(--color-accent)]
                  transition-all
                "
              />
            </div>

            {/* Categoria */}
            <select
              value={filtros.categoria}
              onChange={(e) => setFiltros({ categoria: e.target.value })}
              className="
                w-full px-3 py-2 rounded-lg text-sm
                bg-[var(--color-bg-secondary)] border border-[var(--color-border)]
                text-[var(--color-text-primary)]
                focus:outline-none focus:border-[var(--color-accent)]
                transition-all
              "
            >
              <option value="todos">Todas as categorias</option>
              {categoriasMock.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            {/* Estoque */}
            <select
              value={filtros.estoque}
              onChange={(e) => setFiltros({ estoque: e.target.value as 'todos' | 'disponivel' | 'esgotado' })}
              className="
                w-full px-3 py-2 rounded-lg text-sm
                bg-[var(--color-bg-secondary)] border border-[var(--color-border)]
                text-[var(--color-text-primary)]
                focus:outline-none focus:border-[var(--color-accent)]
                transition-all
              "
            >
              <option value="todos">Todo estoque</option>
              <option value="disponivel">Disponível</option>
              <option value="esgotado">Esgotado</option>
            </select>

            {/* Status */}
            <select
              value={filtros.status}
              onChange={(e) => setFiltros({ status: e.target.value as any })}
              className="
                w-full px-3 py-2 rounded-lg text-sm
                bg-[var(--color-bg-secondary)] border border-[var(--color-border)]
                text-[var(--color-text-primary)]
                focus:outline-none focus:border-[var(--color-accent)]
                transition-all
              "
            >
              <option value="todos">Todos os status</option>
              <option value="active">Ativo</option>
              <option value="paused">Pausado</option>
              <option value="closed">Encerrado</option>
            </select>
          </div>
        </div>
      )}

      {/* Loading */}
      {carregando && (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader2 className="w-10 h-10 text-[var(--color-accent)] animate-spin mx-auto mb-3" />
            <p className="text-sm text-[var(--color-text-secondary)]">
              Sincronizando produtos do Mercado Livre...
            </p>
          </div>
        </div>
      )}

      {/* Grid de produtos */}
      {!carregando && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {listaProdutos.map((produto, i) => {
            const desconto = calcularDesconto(
              produto.preco,
              produto.precoPromocional || produto.preco,
            )

            return (
              <div
                key={produto.id}
                className={`
                  rounded-xl border border-[var(--color-border)]
                  bg-[var(--color-surface)] overflow-hidden
                  card-hover
                  animate-slide-in-up
                `}
                style={{ animationDelay: `${Math.min(i * 0.05, 0.3)}s`, opacity: 0, animationFillMode: 'forwards' }}
              >
                {/* Imagem */}
                <div className="relative aspect-square bg-[var(--color-bg-secondary)]">
                  <img
                    src={produto.imagemPrincipal}
                    alt={produto.titulo}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    width={400}
                    height={400}
                  />
                  {desconto > 0 && (
                    <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-[var(--color-accent)] text-[var(--color-text-inverse)] text-xs font-bold">
                      -{desconto}%
                    </span>
                  )}
                  <span
                    className={`absolute top-2 left-2 badge ${
                      produto.status === 'active'
                        ? 'badge--active'
                        : produto.status === 'paused'
                        ? 'badge--paused'
                        : 'badge--closed'
                    }`}
                  >
                    {produto.status === 'active'
                      ? 'Ativo'
                      : produto.status === 'paused'
                      ? 'Pausado'
                      : 'Encerrado'}
                  </span>
                </div>

                {/* Info */}
                <div className="p-3 space-y-2">
                  <p className="text-sm font-medium text-[var(--color-text-primary)] line-clamp-2 leading-tight min-h-[2.5rem]">
                    {produto.titulo}
                  </p>

                  <div className="flex items-baseline gap-2">
                    {produto.precoPromocional && produto.precoPromocional < produto.preco && (
                      <span className="price-old">
                        {formatarPreco(produto.preco)}
                      </span>
                    )}
                    <span className="price-new text-lg">
                      {formatarPreco(produto.precoPromocional || produto.preco)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-[var(--color-text-secondary)]">
                    <span>SKU: {produto.sku || '—'}</span>
                    <span className={produto.estoque > 0 ? 'text-[var(--color-accent)]' : 'text-[var(--color-danger)]'}>
                      {produto.estoque > 0 ? `${produto.estoque} un.` : 'Esgotado'}
                    </span>
                  </div>

                  {/* Ações */}
                  <div className="flex gap-2 pt-2 border-t border-[var(--color-border)]">
                    <button
                      onClick={() => importarParaOferta(produto)}
                      className="
                        flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg
                        bg-[var(--color-accent)] text-[var(--color-text-inverse)]
                        text-xs font-semibold
                        hover:bg-[var(--color-accent-light)]
                        transition-all
                      "
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      Criar Oferta
                    </button>
                    <a
                      href={produto.linkAnuncio}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="
                        p-2 rounded-lg border border-[var(--color-border)]
                        text-[var(--color-text-secondary)]
                        hover:bg-[var(--color-surface-hover)]
                        hover:text-[var(--color-text-primary)]
                        transition-all
                      "
                      aria-label="Abrir anúncio"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Vazio */}
      {!carregando && listaProdutos.length === 0 && (
        <div className="text-center py-20">
          <Package className="w-16 h-16 text-[var(--color-border)] mx-auto mb-4" />
          <p className="text-lg font-medium text-[var(--color-text-primary)] mb-2">
            Nenhum produto encontrado
          </p>
          <p className="text-sm text-[var(--color-text-secondary)] mb-4">
            {temFiltrosAtivos
              ? 'Tente ajustar os filtros para encontrar seus produtos.'
              : 'Clique em "Sincronizar" para importar seus produtos do Mercado Livre.'}
          </p>
          {temFiltrosAtivos && (
            <button
              onClick={limparFiltros}
              className="text-sm text-[var(--color-accent)] font-medium hover:underline"
            >
              Limpar filtros
            </button>
          )}
        </div>
      )}
    </div>
  )
}
