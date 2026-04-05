/**
 * App — Layout principal com roteamento
 * Sidebar + Header + Conteúdo
 */
import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'
import Dashboard from '@/pages/Dashboard'
import Products from '@/pages/Products'
import NewOffer from '@/pages/NewOffer'
import Library from '@/pages/Library'
import History from '@/pages/History'
import Settings from '@/pages/Settings'
import MLCallback from '@/pages/MLCallback'

export default function App() {
  const [sidebarAberta, setSidebarAberta] = useState(false)

  return (
    <BrowserRouter>
      <div className="layout">
        {/* Sidebar */}
        <Sidebar
          aberta={sidebarAberta}
          onFechar={() => setSidebarAberta(false)}
        />

        {/* Conteúdo principal */}
        <div className="layout__content">
          <Header onMenuClick={() => setSidebarAberta(true)} />

          <main className="layout__main">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/produtos" element={<Products />} />
              <Route path="/nova-oferta" element={<NewOffer />} />
              <Route path="/biblioteca" element={<Library />} />
              <Route path="/historico" element={<History />} />
              <Route path="/configuracoes" element={<Settings />} />
              <Route path="/ml-callback" element={<MLCallback />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  )
}
