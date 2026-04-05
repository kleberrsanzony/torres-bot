/**
 * Sidebar — Navegação principal do sistema
 * Colapsável em desktop, overlay em mobile.
 */
import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
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
  { caminho: '/historico', label: 'Histórico', icone: Clock },
  { caminho: '/configuracoes', label: 'Configurações', icone: Settings },
]

export default function Sidebar({ aberta, onFechar }: SidebarProps) {
  const [colapsada, setColapsada] = useState(false)
  const location = useLocation()

  return (
    <>
      {/* Overlay mobile */}
      {aberta && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
          onClick={onFechar}
          aria-hidden="true"
        />
      )}

      <aside
        className={`
          layout__sidebar glass-strong flex flex-col
          ${aberta ? 'layout__sidebar--open' : ''}
          ${colapsada ? 'layout__sidebar--collapsed' : ''}
        `}
        role="navigation"
        aria-label="Menu principal"
      >
        {/* Cabeçalho da sidebar */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)]">
          {!colapsada && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[var(--color-accent)] flex items-center justify-center">
                <MessageSquare className="w-4 h-4 text-[var(--color-text-inverse)]" />
              </div>
              <div>
                <h1 className="text-sm font-bold text-[var(--color-text-primary)] leading-tight">
                  WhatsApp Pro
                </h1>
                <p className="text-[10px] text-[var(--color-text-secondary)]">
                  Painel de Ofertas
                </p>
              </div>
            </div>
          )}

          {colapsada && (
            <div className="w-8 h-8 rounded-lg bg-[var(--color-accent)] flex items-center justify-center mx-auto">
              <Zap className="w-4 h-4 text-[var(--color-text-inverse)]" />
            </div>
          )}

          {/* Botão fechar (mobile) */}
          <button
            onClick={onFechar}
            className="lg:hidden p-1 rounded-md hover:bg-[var(--color-surface-hover)] text-[var(--color-text-secondary)]"
            aria-label="Fechar menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Itens do menu */}
        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {itensMenu.map((item) => {
            const Icone = item.icone
            const ativo = location.pathname === item.caminho

            return (
              <NavLink
                key={item.caminho}
                to={item.caminho}
                onClick={onFechar}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg
                  text-sm font-medium transition-all duration-200
                  group relative
                  ${
                    ativo
                      ? 'bg-[var(--color-accent-soft)] text-[var(--color-accent)]'
                      : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-primary)]'
                  }
                `}
              >
                {/* Indicador ativo */}
                {ativo && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-[var(--color-accent)] rounded-r-full" />
                )}

                <Icone className={`w-5 h-5 flex-shrink-0 ${ativo ? 'text-[var(--color-accent)]' : ''}`} />

                {!colapsada && <span>{item.label}</span>}

                {/* Tooltip quando colapsada */}
                {colapsada && (
                  <div className="
                    absolute left-full ml-2 px-2 py-1 rounded-md
                    bg-[var(--color-surface)] border border-[var(--color-border)]
                    text-xs text-[var(--color-text-primary)] whitespace-nowrap
                    opacity-0 group-hover:opacity-100 pointer-events-none
                    transition-opacity z-50
                  ">
                    {item.label}
                  </div>
                )}
              </NavLink>
            )
          })}
        </nav>

        {/* Botão colapsar (desktop) */}
        <div className="hidden lg:block p-2 border-t border-[var(--color-border)]">
          <button
            onClick={() => setColapsada(!colapsada)}
            className="
              w-full flex items-center justify-center gap-2 px-3 py-2
              rounded-lg text-sm text-[var(--color-text-secondary)]
              hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-primary)]
              transition-all
            "
            aria-label={colapsada ? 'Expandir menu' : 'Colapsar menu'}
          >
            {colapsada ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <>
                <ChevronLeft className="w-4 h-4" />
                <span>Recolher</span>
              </>
            )}
          </button>
        </div>

        {/* Rodapé — Sanzony Tech™ */}
        {!colapsada && (
          <footer className="p-3 border-t border-[var(--color-border)]">
            <small className="text-[10px] text-[var(--color-text-secondary)] block text-center leading-tight">
              © {new Date().getFullYear()} Desenvolvido por Sanzony Tech™.
              <br />
              Todos os direitos reservados.
            </small>
          </footer>
        )}
      </aside>
    </>
  )
}
