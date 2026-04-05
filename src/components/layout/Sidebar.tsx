import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  ShoppingBag,
  PlusCircle,
  Library,
  Clock,
  Settings,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Zap,
  X,
} from 'lucide-react'

interface SidebarProps {
  aberta: boolean
  onFechar: () => void
}

const itensMenu = [
  { caminho: '/', label: 'Dashboard', icone: LayoutDashboard },
  { caminho: '/produtos', label: 'Meus Produtos', icone: ShoppingBag },
  { caminho: '/nova-oferta', label: 'Nova Oferta', icone: PlusCircle },
  { caminho: '/biblioteca', label: 'Biblioteca', icone: Library },
  { caminho: '/fabrica', label: 'Fábrica de Ofertas', icone: Zap },
  { caminho: '/historico', label: 'Histórico', icone: Clock },
  { caminho: '/configuracoes', label: 'Configurações', icone: Settings },
]

export default function Sidebar({ aberta, onFechar }: SidebarProps) {
  const [colapsada, setColapsada] = useState(false)
  const location = useLocation()

  return (
    <>
      <AnimatePresence>
        {aberta && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onFechar}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-30 lg:hidden"
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      <aside
        className={`
          layout__sidebar border-r border-[var(--color-border)] flex flex-col z-40
          bg-[var(--color-bg-primary)]
          ${aberta ? 'layout__sidebar--open' : ''}
          ${colapsada ? 'layout__sidebar--collapsed' : ''}
        `}
        role="navigation"
        aria-label="Menu principal"
      >
        {/* Cabeçalho da sidebar */}
        <div className="flex items-center justify-between p-6 mb-4">
          {!colapsada && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-[var(--color-gradient-gold)] flex items-center justify-center shadow-[0_0_15px_rgba(212,175,55,0.3)]">
                <Zap className="w-5 h-5 text-[var(--color-text-inverse)]" />
              </div>
              <div>
                <h1 className="text-base font-black tracking-tighter text-[var(--color-text-primary)]">
                  TORRES <span className="text-[var(--color-accent)]">PRO</span>
                </h1>
                <p className="text-[10px] uppercase font-bold tracking-widest text-[var(--color-text-muted)]">
                  WhatsApp Bot
                </p>
              </div>
            </motion.div>
          )}

          {colapsada && (
            <div className="w-10 h-10 rounded-xl bg-[var(--color-gradient-gold)] flex items-center justify-center mx-auto shadow-[0_0_15px_rgba(212,175,55,0.3)]">
              <Zap className="w-5 h-5 text-[var(--color-text-inverse)]" />
            </div>
          )}

          {/* Botão fechar (mobile) */}
          <button
            onClick={onFechar}
            className="lg:hidden p-2 rounded-xl bg-[var(--color-surface)] text-[var(--color-text-primary)]"
            aria-label="Fechar menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Itens do menu */}
        <nav className="flex-1 py-2 px-4 space-y-2 overflow-y-auto custom-scrollbar">
          {itensMenu.map((item) => {
            const Icone = item.icone
            const ativo = location.pathname === item.caminho

            return (
              <NavLink
                key={item.caminho}
                to={item.caminho}
                onClick={onFechar}
                className={`
                  flex items-center gap-3 px-4 py-3.5 rounded-xl
                  text-sm font-semibold transition-all duration-300
                  group relative
                  ${
                    ativo
                      ? 'bg-[var(--color-accent-soft)] text-[var(--color-accent)] shadow-[inset_0_0_0_1px_rgba(212,175,55,0.2)]'
                      : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-primary)]'
                  }
                `}
              >
                {/* Indicador ativo */}
                {ativo && (
                  <motion.div 
                    layoutId="activeTab"
                    className="absolute inset-0 border-l-[3px] border-[var(--color-accent)] bg-gradient-to-r from-[var(--color-accent-soft)] to-transparent rounded-xl" 
                  />
                )}

                <Icone className={`w-5 h-5 relative z-10 ${ativo ? 'text-[var(--color-accent)]' : 'group-hover:scale-110 transition-transform'}`} />

                {!colapsada && <span className="relative z-10">{item.label}</span>}
              </NavLink>
            )
          })}
        </nav>

        {/* Botão colapsar (desktop) */}
        <div className="hidden lg:block p-4">
          <button
            onClick={() => setColapsada(!colapsada)}
            className="
              w-full flex items-center justify-center gap-2 px-4 py-3
              rounded-xl text-sm font-bold text-[var(--color-text-secondary)]
              bg-[var(--color-surface)] border border-[var(--color-border)]
              hover:border-[var(--color-accent)] hover:text-[var(--color-text-primary)]
              transition-all duration-300
            "
          >
            {colapsada ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
            {!colapsada && <span>Recolher Painel</span>}
          </button>
        </div>

        {/* Rodapé — Sanzony Tech™ */}
        <div className="p-6 border-t border-[var(--color-border)]">
          <div className="flex flex-col items-center text-center gap-1">
             <div className="text-[9px] font-black tracking-[0.2em] text-[var(--color-accent)] uppercase">
               Premium Edition
             </div>
             <div className="text-[10px] font-medium text-[var(--color-text-muted)]">
                © {new Date().getFullYear()} Sanzony Tech™
             </div>
          </div>
        </div>
      </aside>
    </>
  )
}
