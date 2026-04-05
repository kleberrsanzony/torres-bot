/**
 * Store de Configurações — Zustand com persistência
 * Preferências da loja e integração Mercado Livre.
 */
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Configuracoes, EstiloCopy } from '@/types'

interface SettingsState extends Configuracoes {
  atualizarConfig: (dados: Partial<Configuracoes>) => void
  resetarConfig: () => void
}

const configPadrao: Configuracoes = {
  nomeLoja: 'Minha Loja Tech',
  numeroWhatsApp: '',
  linkGrupo: '',
  mensagemPadrao: 'Olá! Vi esta oferta e tenho interesse.',
  estiloCopyPadrao: 'vendedor' as EstiloCopy,
  tema: 'dark',
  mlConectado: false,
  mlSellerId: '',
  mlNomeLoja: '',
  mlUltimaSincronizacao: '',
  /** Credenciais ML */
  mlClientId: '',
  mlClientSecret: '',
  mlRedirectUri: `${window.location.origin}/ml-callback`,
  /** Evolution API */
  evoUrl: '',
  evoApiKey: '',
  evoInstanceName: '',
  evoGroupJid: '',
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...configPadrao,

      atualizarConfig: (dados) => {
        set((state) => ({ ...state, ...dados }))
      },

      resetarConfig: () => {
        set({ ...configPadrao })
      },
    }),
    { name: 'torres-settings' },
  ),
)
