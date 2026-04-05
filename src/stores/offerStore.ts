/**
 * Store de Ofertas — Zustand com persistência localStorage
 * CRUD completo de ofertas geradas.
 */
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Oferta, StatusOferta, FiltrosOferta } from '@/types'
import { gerarId } from '@/lib/utils'

interface OfferState {
  ofertas: Oferta[]
  filtros: FiltrosOferta

  adicionarOferta: (oferta: Omit<Oferta, 'id' | 'dataCriacao' | 'dataAtualizacao'>) => Oferta
  atualizarOferta: (id: string, dados: Partial<Oferta>) => void
  excluirOferta: (id: string) => void
  duplicarOferta: (id: string) => Oferta | null
  alternarFavorita: (id: string) => void
  alterarStatus: (id: string, status: StatusOferta) => void
  buscarOferta: (id: string) => Oferta | undefined
  setFiltros: (filtros: Partial<FiltrosOferta>) => void
  limparFiltros: () => void
  ofertasFiltradas: () => Oferta[]
}

const filtrosIniciais: FiltrosOferta = {
  busca: '',
  status: 'todos',
  dataInicio: '',
  dataFim: '',
}

export const useOfferStore = create<OfferState>()(
  persist(
    (set, get) => ({
      ofertas: [],
      filtros: { ...filtrosIniciais },

      adicionarOferta: (dados) => {
        const agora = new Date().toISOString()
        const novaOferta: Oferta = {
          ...dados,
          id: gerarId(),
          dataCriacao: agora,
          dataAtualizacao: agora,
        }
        set((state) => ({
          ofertas: [novaOferta, ...state.ofertas],
        }))
        return novaOferta
      },

      atualizarOferta: (id, dados) => {
        set((state) => ({
          ofertas: state.ofertas.map((o) =>
            o.id === id
              ? { ...o, ...dados, dataAtualizacao: new Date().toISOString() }
              : o,
          ),
        }))
      },

      excluirOferta: (id) => {
        set((state) => ({
          ofertas: state.ofertas.filter((o) => o.id !== id),
        }))
      },

      duplicarOferta: (id) => {
        const original = get().ofertas.find((o) => o.id === id)
        if (!original) return null

        const agora = new Date().toISOString()
        const copia: Oferta = {
          ...original,
          id: gerarId(),
          nomeProduto: `${original.nomeProduto} (cópia)`,
          status: 'rascunho',
          favorita: false,
          dataCriacao: agora,
          dataAtualizacao: agora,
          dataEnvio: undefined,
        }
        set((state) => ({
          ofertas: [copia, ...state.ofertas],
        }))
        return copia
      },

      alternarFavorita: (id) => {
        set((state) => ({
          ofertas: state.ofertas.map((o) =>
            o.id === id ? { ...o, favorita: !o.favorita } : o,
          ),
        }))
      },

      alterarStatus: (id, status) => {
        const dados: Partial<Oferta> = {
          status,
          dataAtualizacao: new Date().toISOString(),
        }
        if (status === 'enviada') {
          dados.dataEnvio = new Date().toISOString()
        }
        set((state) => ({
          ofertas: state.ofertas.map((o) =>
            o.id === id ? { ...o, ...dados } : o,
          ),
        }))
      },

      buscarOferta: (id) => {
        return get().ofertas.find((o) => o.id === id)
      },

      setFiltros: (novosFiltros) => {
        set((state) => ({
          filtros: { ...state.filtros, ...novosFiltros },
        }))
      },

      limparFiltros: () => {
        set({ filtros: { ...filtrosIniciais } })
      },

      ofertasFiltradas: () => {
        const { ofertas, filtros } = get()
        return ofertas.filter((o) => {
          if (
            filtros.busca &&
            !o.nomeProduto.toLowerCase().includes(filtros.busca.toLowerCase())
          ) {
            return false
          }
          if (filtros.status !== 'todos' && o.status !== filtros.status) {
            return false
          }
          if (filtros.dataInicio && o.dataCriacao < filtros.dataInicio) {
            return false
          }
          if (filtros.dataFim && o.dataCriacao > filtros.dataFim) {
            return false
          }
          return true
        })
      },
    }),
    { name: 'torres-offers' },
  ),
)
