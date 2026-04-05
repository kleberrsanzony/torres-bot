import { motion, AnimatePresence } from 'framer-motion'
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
  Calendar,
  Hash,
} from 'lucide-react'
import { useHistoryStore } from '@/stores/historyStore'
import { formatarDataHora } from '@/lib/utils'
import type { RegistroHistorico } from '@/types'

const iconesAcao: Record<RegistroHistorico['acao'], any> = {
  criada: FileText,
  enviada: Send,
  editada: Edit3,
  duplicada: Copy,
  arquivada: Archive,
  excluida: Trash2,
}

const coresAcao: Record<RegistroHistorico['acao'], string> = {
  criada: 'text-blue-500',
  enviada: 'text-emerald-500',
  editada: 'text-amber-500',
  duplicada: 'text-purple-500',
  arquivada: 'text-slate-500',
  excluida: 'text-red-500',
}

const labelsAcao: Record<RegistroHistorico['acao'], string> = {
  criada: 'NOVA OFERTA',
  enviada: 'DISPARO WHATSAPP',
  editada: 'ATUALIZADO',
  duplicada: 'CLONADO',
  arquivada: 'ARQUIVADO',
  excluida: 'REMOVIDO',
}

export default function History() {
  const { registros, limparHistorico } = useHistoryStore()

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  }

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      className="max-w-4xl mx-auto space-y-8 pb-20"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-white">
            Linha do <span className="text-[var(--color-accent)]">Tempo</span>
          </h1>
          <p className="text-sm font-medium text-[var(--color-text-muted)] uppercase tracking-widest leading-none">
            {registros.length} Eventos de DNA Torres
          </p>
        </div>
        
        {registros.length > 0 && (
          <button
            onClick={() => confirm('Limpar todo o histórico?') && limparHistorico()}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-lg"
          >
            <Trash className="w-4 h-4" />
            Limpar Registro
          </button>
        )}
      </div>

      {registros.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-32 bg-[var(--color-surface)]/30 backdrop-blur-md rounded-[3rem] border border-[var(--color-border)] border-dashed"
        >
          <Clock className="w-16 h-16 text-[var(--color-border)] mx-auto mb-6 opacity-50" />
          <h3 className="text-xl font-black text-white mb-2">Sem Pulsação do Sistema</h3>
          <p className="text-sm text-[var(--color-text-muted)] max-w-xs mx-auto uppercase tracking-tighter">
            Nenhuma atividade detectada no ecossistema até o momento.
          </p>
        </motion.div>
      ) : (
        <div className="relative">
          {/* Linha vertical estilizada */}
          <div className="absolute left-6 top-0 bottom-0 w-1 bg-gradient-to-b from-[var(--color-accent)]/50 via-[var(--color-border)] to-transparent rounded-full" />

          <motion.div 
            variants={containerVariants}
            className="space-y-6"
          >
            {registros.map((registro) => {
              const Icone = iconesAcao[registro.acao] || FileText
              const corClass = coresAcao[registro.acao] || 'text-slate-500'
              const label = labelsAcao[registro.acao] || registro.acao

              return (
                <motion.div
                  key={registro.id}
                  variants={itemVariants}
                  className="relative flex items-start gap-8 pl-2 group"
                >
                  {/* Ponto da Timeline */}
                  <div className="relative z-10 flex-shrink-0 w-10 h-10 rounded-2xl bg-[var(--color-bg-primary)] border-2 border-[var(--color-border)] flex items-center justify-center text-white shadow-xl group-hover:border-[var(--color-accent)] transition-all">
                    <Icone className={`w-5 h-5 ${corClass}`} />
                  </div>

                  {/* Card do Conteúdo */}
                  <div className="flex-1 p-6 rounded-[2rem] border border-[var(--color-border)] bg-[var(--color-surface)]/60 backdrop-blur-sm group-hover:bg-[var(--color-surface)] transition-all shadow-lg">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-2.5 py-1 rounded-full bg-[var(--color-bg-primary)] ${corClass} border border-current/10`}>
                            {label}
                          </span>
                          <span className="text-[10px] font-bold text-[var(--color-text-muted)] flex items-center gap-1 opacity-50">
                             <Calendar className="w-3 h-3" /> {formatarDataHora(registro.data)}
                          </span>
                        </div>
                        <h4 className="text-lg font-black text-white leading-tight">
                          {registro.produtoNome}
                        </h4>
                      </div>
                      
                      <div className="flex items-center gap-1 text-[var(--color-accent)]">
                         <Hash className="w-3 h-3" />
                         <span className="text-[10px] font-mono font-bold tracking-tighter opacity-60">ID-{registro.id.slice(0,6).toUpperCase()}</span>
                      </div>
                    </div>

                    {registro.copyUsada && (
                      <div className="relative mt-4">
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--color-accent)]/20 rounded-full" />
                        <p className="pl-4 text-xs font-medium text-[var(--color-text-muted)] line-clamp-3 leading-relaxed whitespace-pre-wrap italic">
                          "{registro.copyUsada}"
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      )}
    </motion.div>
  )
}
