/**
 * Dashboard — Página inicial do sistema
 * Métricas, ofertas recentes, botões de ação.
 */
import { useNavigate } from 'react-router-dom'
import {
  ShoppingBag,
  FileText,
  Send,
  TrendingUp,
  PlusCircle,
  Download,
  ArrowRight,
  Star,
  Zap,
  Clock,
} from 'lucide-react'
import { useProductStore } from '@/stores/productStore'
import { useOfferStore } from '@/stores/offerStore'
import { useHistoryStore } from '@/stores/historyStore'
import { formatarPreco, formatarData, ehHoje, calcularDesconto } from '@/lib/utils'

export default function Dashboard() {
  const navigate = useNavigate()
  const produtos = useProductStore((s) => s.produtos)
  const ofertas = useOfferStore((s) => s.ofertas)
  const registros = useHistoryStore((s) => s.registros)

  const ofertasHoje = ofertas.filter((o) => ehHoje(o.dataCriacao)).length
  const ofertasEnviadas = ofertas.filter((o) => o.status === 'enviada').length
  const ofertasRecentes = ofertas.slice(0, 5)

  const metricas = [
    {
      label: 'Produtos Importados',
      valor: produtos.length,
      icone: ShoppingBag,
      cor: 'var(--color-info)',
      bgCor: 'var(--color-info-soft)',
    },
    {
      label: 'Ofertas Criadas',
      valor: ofertas.length,
      icone: FileText,
      cor: 'var(--color-accent)',
      bgCor: 'var(--color-accent-soft)',
    },
    {
      label: 'Enviadas Hoje',
      valor: ofertasHoje,
      icone: Send,
      cor: 'var(--color-whatsapp)',
      bgCor: 'rgba(37, 211, 102, 0.12)',
    },
    {
      label: 'Total Enviadas',
      valor: ofertasEnviadas,
      icone: TrendingUp,
      cor: 'var(--color-warning)',
      bgCor: 'var(--color-warning-soft)',
    },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Saudação */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
            Painel de Ofertas
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            Gerencie seus produtos e converta em vendas pelo WhatsApp
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => navigate('/produtos')}
            className="
              flex items-center gap-2 px-4 py-2.5 rounded-lg
              bg-[var(--color-surface)] border border-[var(--color-border)]
              text-sm font-medium text-[var(--color-text-primary)]
              hover:bg-[var(--color-surface-hover)] hover:border-[var(--color-accent)]
              transition-all
            "
          >
            <Download className="w-4 h-4" />
            Importar do ML
          </button>
          <button
            onClick={() => navigate('/nova-oferta')}
            className="
              flex items-center gap-2 px-4 py-2.5 rounded-lg
              bg-[var(--color-accent)] text-[var(--color-text-inverse)]
              text-sm font-bold
              hover:bg-[var(--color-accent-light)]
              transition-all animate-pulse-green
            "
          >
            <PlusCircle className="w-4 h-4" />
            Nova Oferta
          </button>
        </div>
      </div>

      {/* Cards de métricas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metricas.map((m, i) => {
          const Icone = m.icone
          return (
            <div
              key={m.label}
              className={`
                p-4 rounded-xl border border-[var(--color-border)]
                bg-[var(--color-surface)] card-hover
                animate-slide-in-up stagger-${i + 1}
                opacity-0
              `}
            >
              <div className="flex items-center justify-between mb-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ background: m.bgCor }}
                >
                  <Icone className="w-5 h-5" style={{ color: m.cor }} />
                </div>
              </div>
              <p className="text-2xl font-bold text-[var(--color-text-primary)]">
                {m.valor}
              </p>
              <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                {m.label}
              </p>
            </div>
          )
        })}
      </div>

      {/* Seções lado a lado */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Ofertas recentes */}
        <div className="lg:col-span-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-[var(--color-text-primary)] flex items-center gap-2">
              <Zap className="w-4 h-4 text-[var(--color-accent)]" />
              Ofertas Recentes
            </h3>
            {ofertas.length > 0 && (
              <button
                onClick={() => navigate('/biblioteca')}
                className="text-xs text-[var(--color-accent)] hover:underline flex items-center gap-1"
              >
                Ver todas <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>

          {ofertasRecentes.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-[var(--color-border)] mx-auto mb-3" />
              <p className="text-sm text-[var(--color-text-secondary)] mb-4">
                Nenhuma oferta criada ainda
              </p>
              <button
                onClick={() => navigate('/nova-oferta')}
                className="
                  text-sm text-[var(--color-accent)] font-medium
                  hover:underline
                "
              >
                Criar primeira oferta →
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {ofertasRecentes.map((oferta) => (
                <div
                  key={oferta.id}
                  className="
                    flex items-center gap-3 p-3 rounded-lg
                    bg-[var(--color-bg-secondary)]
                    hover:bg-[var(--color-surface-hover)]
                    transition-colors cursor-pointer
                  "
                  onClick={() => navigate('/biblioteca')}
                >
                  <img
                    src={oferta.imagem}
                    alt={oferta.nomeProduto}
                    className="w-12 h-12 rounded-lg object-cover"
                    loading="lazy"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">
                      {oferta.nomeProduto}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="price-old text-xs">
                        {formatarPreco(oferta.precoDe)}
                      </span>
                      <span className="text-sm font-bold text-[var(--color-accent)]">
                        {formatarPreco(oferta.precoPor)}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span
                      className={`badge ${
                        oferta.status === 'enviada'
                          ? 'badge--active'
                          : oferta.status === 'pronta'
                          ? 'badge--active'
                          : oferta.status === 'arquivada'
                          ? 'badge--closed'
                          : 'badge--paused'
                      }`}
                    >
                      {oferta.status}
                    </span>
                    <span className="text-[10px] text-[var(--color-text-secondary)]">
                      {formatarData(oferta.dataCriacao)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Atividade recente */}
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
          <h3 className="text-base font-bold text-[var(--color-text-primary)] flex items-center gap-2 mb-4">
            <Star className="w-4 h-4 text-[var(--color-warning)]" />
            Atividade Recente
          </h3>

          {registros.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="w-10 h-10 text-[var(--color-border)] mx-auto mb-2" />
              <p className="text-xs text-[var(--color-text-secondary)]">
                Nenhuma atividade registrada
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {registros.slice(0, 8).map((r) => (
                <div
                  key={r.id}
                  className="flex items-start gap-2 text-xs"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] mt-1.5 flex-shrink-0" />
                  <div>
                    <p className="text-[var(--color-text-primary)]">
                      {r.produtoNome}
                    </p>
                    <p className="text-[var(--color-text-secondary)] mt-0.5">
                      {r.acao} • {formatarData(r.data)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick tips */}
      <div className="rounded-xl border border-[var(--color-accent-soft)] bg-[var(--color-accent-soft)] p-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-[var(--color-accent)] flex items-center justify-center flex-shrink-0">
            <Zap className="w-4 h-4 text-[var(--color-text-inverse)]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[var(--color-accent)]">
              Dica rápida
            </p>
            <p className="text-xs text-[var(--color-text-secondary)] mt-1">
              Importe seus produtos do Mercado Livre e gere ofertas em segundos. Use o botão "Importar do ML" para começar.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

