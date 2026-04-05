/**
 * Tipos centrais do Painel de Ofertas WhatsApp Pro
 * Todas as interfaces e tipos utilizados no sistema.
 */

/** Status de anúncio no Mercado Livre */
export type StatusAnuncio = 'active' | 'paused' | 'closed' | 'under_review'

/** Status de uma oferta */
export type StatusOferta = 'rascunho' | 'pronta' | 'enviada' | 'arquivada'

/** Estilos de copy disponíveis */
export type EstiloCopy = 'vendedor' | 'varejo' | 'premium'

/** Variação de produto (cor, tamanho, etc.) */
export interface VariacaoProduto {
  id: string
  nome: string
  valor: string
  estoque: number
  preco?: number
}

/** Produto importado do Mercado Livre */
export interface ProdutoML {
  id: string
  titulo: string
  preco: number
  precoPromocional?: number
  linkAnuncio: string
  imagemPrincipal: string
  imagensSecundarias: string[]
  estoque: number
  categoria: string
  marca: string
  sku: string
  status: StatusAnuncio
  variacoes: VariacaoProduto[]
  dataImportacao: string
  vendas: number
  condicao: 'new' | 'used'
}

/** Oferta gerada a partir de um produto */
export interface Oferta {
  id: string
  produtoId: string
  nomeProduto: string
  sku: string
  precoDe: number
  precoPor: number
  linkMercadoLivre: string
  numeroWhatsApp: string
  linkGrupo: string
  descricao: string
  urgencia: string
  imagem: string
  copyGerada: string
  estiloCopy: EstiloCopy
  status: StatusOferta
  favorita: boolean
  dataCriacao: string
  dataEnvio?: string
  dataAtualizacao: string
}

/** Registro no histórico */
export interface RegistroHistorico {
  id: string
  ofertaId: string
  produtoNome: string
  copyUsada: string
  data: string
  acao: 'criada' | 'enviada' | 'editada' | 'duplicada' | 'arquivada' | 'excluida'
  detalhes?: string
}

/** Configurações do sistema */
export interface Configuracoes {
  nomeLoja: string
  numeroWhatsApp: string
  linkGrupo: string
  mensagemPadrao: string
  estiloCopyPadrao: EstiloCopy
  tema: 'dark' | 'light'
  /** Integração Mercado Livre */
  mlConectado: boolean
  mlSellerId: string
  mlNomeLoja: string
  mlUltimaSincronizacao: string
  mlToken?: string
  mlRefreshToken?: string
  /** Credenciais ML App */
  mlClientId?: string
  mlClientSecret?: string
  mlRedirectUri?: string
  /** Evolution API v2 */
  evoUrl?: string
  evoApiKey?: string
  evoInstanceName?: string
  evoGroupJid?: string
}

/** Props do componente de filtros */
export interface FiltrosProduto {
  busca: string
  categoria: string
  precoMin: number
  precoMax: number
  estoque: 'todos' | 'disponivel' | 'esgotado'
  status: StatusAnuncio | 'todos'
}

/** Props do componente de filtros de oferta */
export interface FiltrosOferta {
  busca: string
  status: StatusOferta | 'todos'
  dataInicio: string
  dataFim: string
}

/** Métricas do dashboard */
export interface MetricasDashboard {
  totalProdutos: number
  totalOfertas: number
  ofertasHoje: number
  ofertasEnviadas: number
}
