/**
 * Biblioteca — Listagem completa de ofertas
 * Filtros, ações de CRUD, favoritos.
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
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

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
            Biblioteca de Ofertas
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            {ofertas.length} oferta{ofertas.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
            className={`
              flex items-center gap-2 px-3 py-2 rounded-lg text-sm border transition-all
              ${
                mostrarFiltros || temFiltros
                  ? 'border-[var(--color-accent)] bg-[var(--color-accent-soft)] text-[var(--color-accent)]'
                  : 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]'
              }
            `}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filtros
          </button>
          <button
            onClick={() => navigate('/nova-oferta')}
            className="
              flex items-center gap-2 px-4 py-2 rounded-lg text-sm
              bg-[var(--color-accent)] text-[var(--color-text-inverse)]
              font-bold hover:bg-[var(--color-accent-light)] transition-all
            "
          >
            + Nova Oferta
          </button>
        </div>
      </div>

      {/* Filtros */}
      {mostrarFiltros && (
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 animate-slide-in-up">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">Filtros</h3>
            {temFiltros && (
              <button onClick={limparFiltros} className="text-xs text-[var(--color-accent)] hover:underline flex items-center gap-1">
                <X className="w-3 h-3" /> Limpar
              </button>
            )}
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-secondary)]" />
              <input
                type="text"
                value={filtros.busca}
                onChange={(e) => setFiltros({ busca: e.target.value })}
                placeholder="Buscar oferta..."
                className="w-full pl-9 pr-3 py-2 rounded-lg text-sm bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)] focus:outline-none focus:border-[var(--color-accent)] transition-all"
              />
            </div>
            <select
              value={filtros.status}
              onChange={(e) => setFiltros({ status: e.target.value as StatusOferta | 'todos' })}
              className="w-full px-3 py-2 rounded-lg text-sm bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent)] transition-all"
            >
              <option value="todos">Todos os status</option>
              <option value="rascunho">Rascunho</option>
              <option value="pronta">Pronta</option>
              <option value="enviada">Enviada</option>
              <option value="arquivada">Arquivada</option>
            </select>
          </div>
        </div>
      )}

      {/* Lista */}
      {ofertas.length === 0 ? (
        <div className="text-center py-20">
          <FileText className="w-16 h-16 text-[var(--color-border)] mx-auto mb-4" />
          <p className="text-lg font-medium text-[var(--color-text-primary)] mb-2">
            Nenhuma oferta encontrada
          </p>
          <p className="text-sm text-[var(--color-text-secondary)] mb-4">
            {temFiltros ? 'Tente ajustar os filtros.' : 'Crie sua primeira oferta para começar a vender!'}
          </p>
          <button
            onClick={() => navigate('/nova-oferta')}
            className="text-sm text-[var(--color-accent)] font-medium hover:underline"
          >
            Criar oferta →
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {ofertas.map((oferta) => {
            const desconto = calcularDesconto(oferta.precoDe, oferta.precoPor)
            return (
              <div
                key={oferta.id}
                className="
                  rounded-xl border border-[var(--color-border)]
                  bg-[var(--color-surface)] p-4
                  hover:border-[var(--color-border-light)]
                  transition-all
                "
              >
                <div className="flex gap-4">
                  {/* Imagem */}
                  {oferta.imagem && (
                    <img
                      src={oferta.imagem}
                      alt={oferta.nomeProduto}
                      className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                      loading="lazy"
                    />
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-sm font-semibold text-[var(--color-text-primary)] line-clamp-1">
                          {oferta.nomeProduto}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="price-old text-xs">
                            {formatarPreco(oferta.precoDe)}
                          </span>
                          <span className="text-sm font-bold text-[var(--color-accent)]">
                            {formatarPreco(oferta.precoPor)}
                          </span>
                          {desconto > 0 && (
                            <span className="text-[10px] text-[var(--color-accent)] font-semibold">
                              -{desconto}%
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <span
                          className={`badge ${
                            oferta.status === 'enviada' ? 'badge--active'
                            : oferta.status === 'pronta' ? 'badge--active'
                            : oferta.status === 'arquivada' ? 'badge--closed'
                            : 'badge--paused'
                          }`}
                        >
                          {oferta.status}
                        </span>
                      </div>
                    </div>

                    {/* Ações */}
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => handleCopiar(oferta.copyGerada)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] transition-all"
                        title="Copiar copy"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        Copiar
                      </button>
                      <button
                        onClick={() => oferta.numeroWhatsApp && abrirWhatsApp(oferta.numeroWhatsApp, oferta.copyGerada)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs text-[var(--color-whatsapp)] hover:bg-[rgba(37,211,102,0.1)] transition-all"
                        title="Abrir no WhatsApp"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        WhatsApp
                      </button>
                      <button
                        onClick={() => alternarFavorita(oferta.id)}
                        className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs transition-all ${
                          oferta.favorita
                            ? 'text-[var(--color-warning)] bg-[var(--color-warning-soft)]'
                            : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]'
                        }`}
                        title={oferta.favorita ? 'Remover favorito' : 'Favoritar'}
                      >
                        <Heart className={`w-3.5 h-3.5 ${oferta.favorita ? 'fill-current' : ''}`} />
                      </button>
                      <button
                        onClick={() => handleDuplicar(oferta.id)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] transition-all"
                        title="Duplicar"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        Duplicar
                      </button>
                      <button
                        onClick={() => handleArquivar(oferta.id, oferta.nomeProduto)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] transition-all"
                        title="Arquivar"
                      >
                        <Archive className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleExcluir(oferta.id, oferta.nomeProduto)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs text-[var(--color-danger)] hover:bg-[var(--color-danger-soft)] transition-all"
                        title="Excluir"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <span className="text-[10px] text-[var(--color-text-secondary)] ml-auto">
                        {formatarData(oferta.dataCriacao)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
