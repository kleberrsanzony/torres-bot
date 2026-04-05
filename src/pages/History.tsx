/**
 * Histórico — Timeline de ações do sistema
 */
import {
  Clock,
  FileText,
  Send,
  Edit3,
  Copy,
  Archive,
  Trash2,
  Trash,
  RefreshCw,
} from 'lucide-react'
import { useHistoryStore } from '@/stores/historyStore'
import { formatarDataHora } from '@/lib/utils'
import type { RegistroHistorico } from '@/types'

const iconesAcao: Record<RegistroHistorico['acao'], typeof Send> = {
  criada: FileText,
  enviada: Send,
  editada: Edit3,
  duplicada: Copy,
  arquivada: Archive,
  excluida: Trash2,
}

const coresAcao: Record<RegistroHistorico['acao'], string> = {
  criada: 'var(--color-accent)',
  enviada: 'var(--color-whatsapp)',
  editada: 'var(--color-info)',
  duplicada: 'var(--color-warning)',
  arquivada: 'var(--color-text-secondary)',
  excluida: 'var(--color-danger)',
}

const labelsAcao: Record<RegistroHistorico['acao'], string> = {
  criada: 'Oferta criada',
  enviada: 'Enviada via WhatsApp',
  editada: 'Oferta editada',
  duplicada: 'Oferta duplicada',
  arquivada: 'Oferta arquivada',
  excluida: 'Oferta excluída',
}

export default function History() {
  const { registros, limparHistorico } = useHistoryStore()

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
            Histórico
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            {registros.length} registro{registros.length !== 1 ? 's' : ''} de atividade
          </p>
        </div>
        {registros.length > 0 && (
          <button
            onClick={limparHistorico}
            className="
              flex items-center gap-2 px-3 py-2 rounded-lg text-sm
              border border-[var(--color-border)] text-[var(--color-text-secondary)]
              hover:bg-[var(--color-danger-soft)] hover:text-[var(--color-danger)]
              hover:border-[var(--color-danger)]
              transition-all
            "
          >
            <Trash className="w-4 h-4" />
            Limpar
          </button>
        )}
      </div>

      {registros.length === 0 ? (
        <div className="text-center py-20">
          <Clock className="w-16 h-16 text-[var(--color-border)] mx-auto mb-4" />
          <p className="text-lg font-medium text-[var(--color-text-primary)] mb-2">
            Nenhuma atividade registrada
          </p>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Suas ações aparecerão aqui conforme você usa o sistema.
          </p>
        </div>
      ) : (
        <div className="relative">
          {/* Linha vertical da timeline */}
          <div className="absolute left-5 top-0 bottom-0 w-px bg-[var(--color-border)]" />

          <div className="space-y-4">
            {registros.map((registro, i) => {
              const Icone = iconesAcao[registro.acao] || FileText
              const cor = coresAcao[registro.acao] || 'var(--color-text-secondary)'
              const label = labelsAcao[registro.acao] || registro.acao

              return (
                <div
                  key={registro.id}
                  className="flex items-start gap-4 pl-1 animate-slide-in-left"
                  style={{ animationDelay: `${Math.min(i * 0.05, 0.3)}s`, opacity: 0, animationFillMode: 'forwards' }}
                >
                  {/* Ícone */}
                  <div
                    className="
                      w-10 h-10 rounded-full flex items-center justify-center
                      flex-shrink-0 z-10 border-2
                    "
                    style={{
                      background: `${cor}20`,
                      borderColor: cor,
                    }}
                  >
                    <Icone className="w-4 h-4" style={{ color: cor }} />
                  </div>

                  {/* Conteúdo */}
                  <div className="flex-1 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                          {registro.produtoNome}
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: cor }}>
                          {label}
                        </p>
                      </div>
                      <span className="text-[10px] text-[var(--color-text-secondary)] whitespace-nowrap">
                        {formatarDataHora(registro.data)}
                      </span>
                    </div>

                    {registro.copyUsada && (
                      <div className="mt-2 p-2 rounded-md bg-[var(--color-bg-secondary)] text-xs text-[var(--color-text-secondary)] line-clamp-3 whitespace-pre-wrap">
                        {registro.copyUsada}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
