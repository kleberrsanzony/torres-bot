import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ShoppingBag,
  FileText,
  Send,
  TrendingUp,
  PlusCircle,
  Download,
  ArrowRight,
  Zap,
  Clock,
  ExternalLink,
} from 'lucide-react'
import { useProductStore } from '@/stores/productStore'
import { useOfferStore } from '@/stores/offerStore'
import { useHistoryStore } from '@/stores/historyStore'
import { formatarPreco, formatarData, ehHoje } from '@/lib/utils'

export default function Dashboard() {
  const navigate = useNavigate()
  const produtos = useProductStore((s) => s.produtos)
  const ofertas = useOfferStore((s) => s.ofertas)
  const registros = useHistoryStore((s) => s.registros)

  const ofertasHoje = ofertas.filter((o) => ehHoje(o.dataCriacao)).length
  const ofertasEnviadasCount = ofertas.filter((o) => o.status === 'enviada').length
  const ofertasRecentes = ofertas.slice(0, 5)

  const metricas = [
    {
      label: 'Produtos Loja',
      valor: produtos.length,
      icone: ShoppingBag,
      gradient: 'from-blue-500/20 to-blue-600/5',
      cor: '#3b82f6',
    },
    {
      label: 'Ofertas Geradas',
      valor: ofertas.length,
      icone: FileText,
      gradient: 'from-[var(--color-accent)]/20 to-[var(--color-accent-dark)]/5',
      cor: 'var(--color-accent)',
    },
    {
      label: 'Enviadas Hoje',
      valor: ofertasHoje,
      icone: Send,
      gradient: 'from-emerald-500/20 to-emerald-600/5',
      cor: '#10b981',
    },
    {
      label: 'Sucesso Total',
      valor: ofertasEnviadasCount,
      icone: TrendingUp,
      gradient: 'from-amber-500/20 to-amber-600/5',
      cor: '#f59e0b',
    },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
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
      className="space-y-8 max-w-[1400px] mx-auto pb-12"
    >
      {/* Saudação de Elite */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <motion.div variants={itemVariants} className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-accent-soft)] border border-[var(--color-accent-medium)] mb-2">
             <Zap className="w-3 h-3 text-[var(--color-accent)] fill-[var(--color-accent)]" />
             <span className="text-[10px] font-black uppercase tracking-widest text-[var(--color-accent)]">Sistema Ativo</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-[var(--color-text-primary)] tracking-tight">
            Seu Império de <span className="text-[var(--color-accent)]">Vendas</span>.
          </h1>
          <p className="text-sm font-medium text-[var(--color-text-secondary)]">
            Bem-vindo ao comando, <span className="text-[var(--color-text-primary)] font-bold">Kleber</span>.
          </p>
        </motion.div>

        <motion.div variants={itemVariants} className="flex gap-3">
          <button
            onClick={() => navigate('/produtos')}
            className="
              flex items-center gap-2 px-5 py-3 rounded-xl
              bg-[var(--color-surface)] border border-[var(--color-border)]
              text-sm font-bold text-[var(--color-text-primary)]
              hover:border-[var(--color-accent)] hover:shadow-[0_0_20px_rgba(212,175,55,0.1)]
              transition-all duration-300
            "
          >
            <Download className="w-4 h-4" />
            Sincronizar ML
          </button>
          <button
            onClick={() => navigate('/nova-oferta')}
            className="
              flex items-center gap-2 px-6 py-3 rounded-xl
              bg-[var(--color-gradient-gold)] text-[var(--color-text-inverse)]
              text-sm font-black shadow-[0_4px_15px_rgba(212,175,55,0.3)]
              hover:scale-105 active:scale-95
              transition-all duration-300
            "
          >
            <PlusCircle className="w-4 h-4" />
            Nova Oferta
          </button>
        </motion.div>
      </div>

      {/* Grid de Métricas Premium */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricas.map((m) => {
          const Icone = m.icone
          return (
            <motion.div
              key={m.label}
              variants={itemVariants}
              whileHover={{ y: -5 }}
              className={`
                relative p-6 rounded-2xl border border-[var(--color-border)]
                bg-gradient-to-br ${m.gradient} overflow-hidden group
              `}
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                 <Icone className="w-16 h-16" />
              </div>
              
              <div className="relative z-10 space-y-4">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
                  style={{ background: m.cor, boxShadow: `0 8px 16px ${m.cor}33` }}
                >
                  <Icone className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-3xl font-black text-[var(--color-text-primary)]">
                    {m.valor}
                  </h3>
                  <p className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
                    {m.label}
                  </p>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Painéis Principais */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Ofertas Recentes - Estilo Glass */}
        <motion.div 
          variants={itemVariants}
          className="lg:col-span-2 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]/50 backdrop-blur-sm p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
               <div className="w-2 h-8 bg-[var(--color-accent)] rounded-full" />
               <h3 className="text-lg font-black text-[var(--color-text-primary)]">
                 Injeção de Ofertas
               </h3>
            </div>
            {ofertas.length > 0 && (
              <button
                onClick={() => navigate('/biblioteca')}
                className="text-xs font-bold text-[var(--color-accent)] hover:text-[var(--color-accent-light)] flex items-center gap-1 transition-colors"
              >
                Ver Biblioteca <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>

          {ofertasRecentes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-full bg-[var(--color-surface)] flex items-center justify-center mb-4 border border-dashed border-[var(--color-border)]">
                 <FileText className="w-8 h-8 text-[var(--color-text-muted)]" />
              </div>
              <p className="text-sm font-medium text-[var(--color-text-secondary)] mb-6">
                Pronto para disparar sua primeira oferta?
              </p>
              <button
                onClick={() => navigate('/nova-oferta')}
                className="px-6 py-2.5 bg-[var(--color-surface)] border border-[var(--color-accent)] text-[var(--color-accent)] rounded-xl text-sm font-bold hover:bg-[var(--color-accent)] hover:text-white transition-all"
              >
                Começar Agora
              </button>
            </div>
          ) : (
            <div className="grid gap-3">
              {ofertasRecentes.map((oferta) => (
                <motion.div
                  key={oferta.id}
                  whileHover={{ x: 4 }}
                  className="
                    flex items-center gap-4 p-4 rounded-xl
                    bg-[var(--color-surface)] border border-transparent
                    hover:border-[var(--color-border-light)] hover:shadow-xl
                    transition-all cursor-pointer group
                  "
                  onClick={() => navigate('/biblioteca')}
                >
                  <div className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={oferta.imagem}
                      alt={oferta.nomeProduto}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/20" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-[var(--color-text-primary)] truncate mb-1">
                      {oferta.nomeProduto}
                    </p>
                    <div className="flex items-center gap-3">
                      <span className="text-[var(--color-accent)] font-black">
                        {formatarPreco(oferta.precoPor)}
                      </span>
                      <div className="flex items-center gap-1 text-[10px] font-bold text-[var(--color-text-muted)] uppercase">
                        <Clock className="w-3 h-3" />
                        {formatarData(oferta.dataCriacao)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                     <span className={`
                       px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest
                       ${oferta.status === 'enviada' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}
                     `}>
                       {oferta.status}
                     </span>
                     <ExternalLink className="w-4 h-4 text-[var(--color-text-muted)] group-hover:text-[var(--color-accent)] transition-colors" />
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Linha do Tempo de Atividades */}
        <motion.div 
          variants={itemVariants}
          className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6"
        >
          <h3 className="text-lg font-black text-[var(--color-text-primary)] flex items-center gap-2 mb-6">
            Histórico <span className="text-[var(--color-accent)]">Live</span>
          </h3>

          {registros.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-widest leading-relaxed">
                Aguardando sua primeira<br/>grande venda...
              </p>
            </div>
          ) : (
            <div className="relative space-y-6 before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-[2px] before:bg-[var(--color-border)]">
              {registros.slice(0, 6).map((r) => (
                <div key={r.id} className="relative pl-6">
                  <div className="absolute left-0 top-1.5 w-4 h-4 rounded-full bg-[var(--color-surface)] border-2 border-[var(--color-accent)] shadow-[0_0_8px_rgba(212,175,55,0.4)]" />
                  <div>
                    <p className="text-xs font-bold text-[var(--color-text-primary)] leading-tight">
                      {r.produtoNome}
                    </p>
                    <p className="text-[10px] font-semibold text-[var(--color-text-secondary)] mt-1 italic">
                       {r.acao} • {formatarData(r.data)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  )
}

