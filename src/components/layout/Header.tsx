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
        glass-strong
        border-b border-[var(--color-border)]
        px-4 lg:px-6 py-3
      "
      role="banner"
    >
      <div className="flex items-center justify-between gap-4">
        {/* Menu hamburger (mobile) */}
        <button
          onClick={onMenuClick}
          className="
            lg:hidden p-2 rounded-lg
            hover:bg-[var(--color-surface-hover)]
            text-[var(--color-text-secondary)]
            transition-colors
          "
          aria-label="Abrir menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Título da página */}
        <h2 className="text-lg font-bold text-[var(--color-text-primary)] hidden sm:block">
          {titulo}
        </h2>

        {/* Busca rápida */}
        <div className="flex-1 max-w-md mx-auto sm:mx-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-secondary)]" />
            <input
              type="text"
              placeholder="Buscar produtos, ofertas..."
              className="
                w-full pl-9 pr-4 py-2 rounded-lg
                bg-[var(--color-surface)] border border-[var(--color-border)]
                text-sm text-[var(--color-text-primary)]
                placeholder:text-[var(--color-text-secondary)]
                focus:outline-none focus:border-[var(--color-accent)]
                focus:ring-1 focus:ring-[var(--color-accent)]
                transition-all
              "
              aria-label="Buscar"
            />
          </div>
        </div>

        {/* Notificações */}
        <button
          className="
            relative p-2 rounded-lg
            hover:bg-[var(--color-surface-hover)]
            text-[var(--color-text-secondary)]
            transition-colors
          "
          aria-label="Notificações"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-[var(--color-accent)] rounded-full" />
        </button>
      </div>
    </header>
  )
}
