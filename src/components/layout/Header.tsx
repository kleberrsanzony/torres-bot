/**
 * Header — Barra superior do sistema
 * Menu hamburger, busca rápida, notificações.
 */
import { Menu, Bell, Search } from 'lucide-react'
import { useLocation } from 'react-router-dom'

interface HeaderProps {
  onMenuClick: () => void
}

/** Mapa de títulos por rota */
const titulosPagina: Record<string, string> = {
  '/': 'Dashboard',
  '/produtos': 'Produtos da Minha Loja',
  '/nova-oferta': 'Nova Oferta',
  '/biblioteca': 'Biblioteca de Ofertas',
  '/historico': 'Histórico',
  '/configuracoes': 'Configurações',
}

export default function Header({ onMenuClick }: HeaderProps) {
  const location = useLocation()
  const titulo = titulosPagina[location.pathname] || 'Painel de Ofertas'

  return (
    <header
      className="
        sticky top-0 z-20
        backdrop-blur-md bg-[var(--color-bg-primary)]/80
        border-b border-[var(--color-border)]
        px-4 lg:px-8 py-4
      "
      role="banner"
    >
      <div className="flex items-center justify-between gap-4 max-w-[1600px] mx-auto">
        <div className="flex items-center gap-4">
          {/* Menu hamburger (mobile) */}
          <button
            onClick={onMenuClick}
            className="
              lg:hidden p-2 rounded-xl
              bg-[var(--color-surface)] border border-[var(--color-border)]
              text-[var(--color-text-primary)]
              active:scale-95 transition-all
            "
            aria-label="Abrir menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Logo/Marca para Mobile */}
          <div className="lg:hidden flex items-center gap-2">
            <span className="text-xl font-black bg-[var(--color-gradient-gold)] bg-clip-text text-transparent">
              TORRES
            </span>
          </div>

          {/* Título da página (Desktop) */}
          <h2 className="hidden lg:block text-xl font-extrabold text-[var(--color-text-primary)] tracking-tight">
            {titulo}
          </h2>
        </div>

        {/* Busca rápida - Escondida em mobile muito pequeno */}
        <div className="hidden md:flex flex-1 max-w-md mx-4">
          <div className="relative w-full group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-secondary)] group-focus-within:text-[var(--color-accent)] transition-colors" />
            <input
              type="text"
              placeholder="Buscar produtos ou ofertas..."
              className="
                w-full pl-10 pr-4 py-2.5 rounded-xl
                bg-[var(--color-surface)] border border-[var(--color-border)]
                text-sm text-[var(--color-text-primary)]
                placeholder:text-[var(--color-text-secondary)]
                focus:outline-none focus:border-[var(--color-accent)]
                focus:ring-4 focus:ring-[var(--color-accent-soft)]
                transition-all
              "
              aria-label="Buscar"
            />
          </div>
        </div>

        {/* Ações Direitas */}
        <div className="flex items-center gap-2">
          <button
            className="
              p-2.5 rounded-xl
              bg-[var(--color-surface)] border border-[var(--color-border)]
              text-[var(--color-text-secondary)] hover:text-[var(--color-accent)]
              active:scale-95 transition-all
            "
            aria-label="Notificações"
          >
            <Bell className="w-5 h-5" />
          </button>
          
          <div className="w-10 h-10 rounded-xl bg-[var(--color-gradient-gold)] p-[1px]">
            <div className="w-full h-full rounded-[11px] bg-[var(--color-surface)] flex items-center justify-center font-bold text-xs text-[var(--color-accent)]">
              KS
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
