/**
 * Store de Histórico — Zustand com persistência
 * Registra todas as ações realizadas no sistema.
 */
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { RegistroHistorico } from '@/types'
import { gerarId } from '@/lib/utils'

interface HistoryState {
  registros: RegistroHistorico[]

  adicionarRegistro: (
    dados: Omit<RegistroHistorico, 'id' | 'data'>,
  ) => void
  limparHistorico: () => void
  registrosRecentes: (limite?: number) => RegistroHistorico[]
}

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set, get) => ({
      registros: [],

      adicionarRegistro: (dados) => {
        const registro: RegistroHistorico = {
          ...dados,
          id: gerarId(),
          data: new Date().toISOString(),
        }
        set((state) => ({
          registros: [registro, ...state.registros].slice(0, 500),
        }))
      },

      limparHistorico: () => {
        set({ registros: [] })
      },

      registrosRecentes: (limite = 50) => {
        return get().registros.slice(0, limite)
      },
    }),
    { name: 'torres-history' },
  ),
)
