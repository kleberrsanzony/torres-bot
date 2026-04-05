/**
 * Store de Produtos — Zustand com persistência localStorage
 * Gerencia produtos importados do Mercado Livre.
 */
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ProdutoML, FiltrosProduto } from '@/types'
import { produtosMock } from '@/data/mockProducts'
import { useSettingsStore } from './settingsStore'
import { buscarIdsProdutos, buscarDetalhesProdutos } from '@/services/mercadoLivreService'

interface ProductState {
  /** Lista de produtos importados */
  produtos: ProdutoML[]
  /** Filtros ativos */
  filtros: FiltrosProduto
  /** Indica carregamento */
  carregando: boolean

  /** Importar produtos mock (simula API) */
  importarProdutos: () => void
  /** Sincronizar produtos reais da conta vinculada */
  sincronizarProdutosReais: () => Promise<void>
  /** Atualizar filtros */
  setFiltros: (filtros: Partial<FiltrosProduto>) => void
  /** Limpar filtros */
  limparFiltros: () => void
  /** Obter produtos filtrados */
  produtosFiltrados: () => ProdutoML[]
}

const filtrosIniciais: FiltrosProduto = {
  busca: '',
  categoria: 'todos',
  precoMin: 0,
  precoMax: 99999,
  estoque: 'todos',
  status: 'todos',
}

export const useProductStore = create<ProductState>()(
  persist(
    (set, get) => ({
      produtos: [],
      filtros: { ...filtrosIniciais },
      carregando: false,

      importarProdutos: () => {
        set({ carregando: true })
        /** Simula delay de API */
        setTimeout(() => {
          set({ produtos: produtosMock, carregando: false })
        }, 800)
      },

      sincronizarProdutosReais: async () => {
        const settings = useSettingsStore.getState()
        if (!settings.mlToken || !settings.mlSellerId) {
          throw new Error('Conta do Mercado Livre não vinculada!')
        }

        set({ carregando: true })

        try {
          // 1. Buscar os IDs dos produtos (limitado a 50 para teste)
          const { ids } = await buscarIdsProdutos(
            settings.mlSellerId,
            settings.mlToken,
            0,
            50
          )

          if (ids.length === 0) {
            set({ produtos: [], carregando: false })
            return
          }

          // 2. Buscar detalhes via Multi-Get
          const itemsData = await buscarDetalhesProdutos(ids, settings.mlToken)

          // 3. Mapear para o formato ProdutoML do sistema
          const produtosMapeados: ProdutoML[] = itemsData.map((item: any) => ({
            id: item.id,
            titulo: item.title,
            preco: item.price,
            precoPromocional: item.sale_price || undefined,
            linkAnuncio: item.permalink,
            imagemPrincipal: item.thumbnail ? item.thumbnail.replace('-I.jpg', '-O.jpg') : '',
            imagensSecundarias: item.pictures?.map((p: any) => p.url) || [],
            estoque: item.available_quantity,
            categoria: item.category_id,
            marca: item.attributes?.find((a: any) => a.id === 'BRAND')?.value_name || 'Generérico',
            sku: item.seller_custom_field || item.id,
            status: item.status as any,
            variacoes: item.variations?.map((v: any) => ({
              id: v.id.toString(),
              nome: 'Variação',
              valor: v.attribute_combinations?.map((ac: any) => ac.value_name).join(' / '),
              estoque: v.available_quantity,
              preco: v.price
            })) || [],
            dataImportacao: new Date().toISOString(),
            vendas: item.sold_quantity || 0,
            condicao: item.condition
          }))

          set({ produtos: produtosMapeados, carregando: false })
          
          settings.atualizarConfig({
            mlUltimaSincronizacao: new Date().toISOString()
          })
        } catch (error) {
          console.error('[ProductStore] Erro na sincronização:', error)
          set({ carregando: false })
          throw error
        }
      },

      setFiltros: (novosFiltros) => {
        set((state) => ({
          filtros: { ...state.filtros, ...novosFiltros },
        }))
      },

      limparFiltros: () => {
        set({ filtros: { ...filtrosIniciais } })
      },

      produtosFiltrados: () => {
        const { produtos, filtros } = get()
        return produtos.filter((p) => {
          /** Busca por nome */
          if (
            filtros.busca &&
            !p.titulo.toLowerCase().includes(filtros.busca.toLowerCase()) &&
            !p.sku.toLowerCase().includes(filtros.busca.toLowerCase())
          ) {
            return false
          }
          /** Categoria */
          if (filtros.categoria !== 'todos' && p.categoria !== filtros.categoria) {
            return false
          }
          /** Faixa de preço */
          const preco = p.precoPromocional || p.preco
          if (preco < filtros.precoMin || preco > filtros.precoMax) {
            return false
          }
          /** Estoque */
          if (filtros.estoque === 'disponivel' && p.estoque <= 0) return false
          if (filtros.estoque === 'esgotado' && p.estoque > 0) return false
          /** Status */
          if (filtros.status !== 'todos' && p.status !== filtros.status) {
            return false
          }
          return true
        })
      },
    }),
    {
      name: 'torres-products',
      partialize: (state) => ({
        produtos: state.produtos,
      }),
    },
  ),
)
