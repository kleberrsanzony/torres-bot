/**
 * Nova Oferta — Formulário completo com gerador de copy e preview
 * Auto-preenchimento ao importar produto do ML.
 */
import { useState, useEffect, useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  Send,
  Wand2,
  RefreshCw,
  Minimize2,
  TrendingUp,
  Crown,
  Copy,
  ExternalLink,
  Share2,
  Save,
  CheckCircle,
  MessageSquare,
  Eye,
  Sparkles,
  Flame,
  Zap,
  ArrowLeft,
} from 'lucide-react'
import { useOfferStore } from '@/stores/offerStore'
import { useHistoryStore } from '@/stores/historyStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { gerarCopy, gerarTresVersoes, encurtarCopy, maisVendedor, maisPremium } from '@/lib/copyEngine'
import { gerarLinkWhatsApp, copiarParaClipboard, abrirWhatsApp } from '@/lib/whatsappLink'
import { formatarPreco, calcularDesconto } from '@/lib/utils'
import { enviarMensagemOferta } from '@/services/evolutionService'
import type { ProdutoML, EstiloCopy } from '@/types'

interface FormularioOferta {
  nomeProduto: string
  sku: string
  precoDe: string
  precoPor: string
  linkMercadoLivre: string
  numeroWhatsApp: string
  linkGrupo: string
  descricao: string
  urgencia: string
  imagem: string
}

const formularioInicial: FormularioOferta = {
  nomeProduto: '',
  sku: '',
  precoDe: '',
  precoPor: '',
  linkMercadoLivre: '',
  numeroWhatsApp: '',
  linkGrupo: '',
  descricao: '',
  urgencia: '',
  imagem: '',
}

const estilosCopy: { valor: EstiloCopy; label: string; icone: typeof Flame; descricao: string }[] = [
  { valor: 'vendedor', label: 'Vendedor Direto', icone: Flame, descricao: 'Curto e objetivo' },
  { valor: 'varejo', label: 'Varejo Popular', icone: Zap, descricao: 'Chamativo e promocional' },
  { valor: 'premium', label: 'Premium', icone: Crown, descricao: 'Elegante e credível' },
]

export default function NewOffer() {
  const location = useLocation()
  const navigate = useNavigate()
  const adicionarOferta = useOfferStore((s) => s.adicionarOferta)
  const adicionarRegistro = useHistoryStore((s) => s.adicionarRegistro)
  const settings = useSettingsStore()

  const [form, setForm] = useState<FormularioOferta>({
    ...formularioInicial,
    numeroWhatsApp: settings.numeroWhatsApp,
    linkGrupo: settings.linkGrupo,
  })
  const [estilo, setEstilo] = useState<EstiloCopy>(settings.estiloCopyPadrao)
  const [copyGerada, setCopyGerada] = useState('')
  const [tresVersoes, setTresVersoes] = useState<Record<EstiloCopy, string> | null>(null)
  const [copiado, setCopiado] = useState(false)
  const [salvo, setSalvo] = useState(false)
  const [enviandoEvo, setEnviandoEvo] = useState(false)
  const [mostrarPreview, setMostrarPreview] = useState(false)

  /** Auto-preencher se veio de um produto */
  useEffect(() => {
    const produto = (location.state as { produto?: ProdutoML })?.produto
    if (produto) {
      setForm({
        nomeProduto: produto.titulo,
        sku: produto.sku || '',
        precoDe: produto.preco.toString(),
        precoPor: (produto.precoPromocional || produto.preco).toString(),
        linkMercadoLivre: produto.linkAnuncio,
        numeroWhatsApp: settings.numeroWhatsApp,
        linkGrupo: settings.linkGrupo,
        descricao: '',
        urgencia: produto.estoque <= 5 ? `Apenas ${produto.estoque} unidades em estoque!` : '',
        imagem: produto.imagemPrincipal,
      })
    }
  }, [location.state])

  /** Atualizar campo do formulário */
  const atualizarCampo = useCallback(
    (campo: keyof FormularioOferta, valor: string) => {
      setForm((prev) => ({ ...prev, [campo]: valor }))
    },
    [],
  )

  /** Dados formatados para o engine de copy */
  function dadosCopy() {
    return {
      nomeProduto: form.nomeProduto,
      sku: form.sku,
      precoDe: parseFloat(form.precoDe) || 0,
      precoPor: parseFloat(form.precoPor) || 0,
      linkMercadoLivre: form.linkMercadoLivre,
      descricao: form.descricao,
      urgencia: form.urgencia,
    }
  }

  /** Gerar copy */
  function handleGerarCopy() {
    const copy = gerarCopy(estilo, dadosCopy())
    setCopyGerada(copy)
    setTresVersoes(null)
    setMostrarPreview(true)
  }

  /** Gerar 3 versões */
  function handleGerarTresVersoes() {
    const versoes = gerarTresVersoes(dadosCopy())
    setTresVersoes(versoes)
    setCopyGerada(versoes[estilo])
    setMostrarPreview(true)
  }

  /** Copiar copy */
  async function handleCopiar() {
    const ok = await copiarParaClipboard(copyGerada)
    if (ok) {
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    }
  }

  /** Abrir WhatsApp */
  function handleAbrirWhatsApp() {
    if (!form.numeroWhatsApp) {
      alert('Configure o número do WhatsApp primeiro.')
      return
    }
    abrirWhatsApp(form.numeroWhatsApp, copyGerada)
  }

  /** Enviar Automático via Evolution API */
  async function handleEnviarEvo() {
    if (!settings.evoUrl || !settings.evoApiKey || !settings.evoInstanceName || !settings.evoGroupJid) {
      alert('Configure a Evolution API nas Configurações primeiro.')
      return
    }

    setEnviandoEvo(true)
    try {
      await enviarMensagemOferta({
        url: settings.evoUrl,
        apiKey: settings.evoApiKey,
        instanceName: settings.evoInstanceName,
        remoteJid: settings.evoGroupJid,
        mediaUrl: form.imagem,
        caption: copyGerada
      })
      
      adicionarRegistro({
        ofertaId: 'evo-' + Date.now(),
        produtoNome: form.nomeProduto,
        copyUsada: copyGerada,
        acao: 'enviada',
        detalhes: 'Enviado via Evolution API para o grupo'
      })

      alert('Oferta enviada com sucesso para o grupo!')
    } catch (error: any) {
      alert('Erro ao enviar: ' + error.message)
    } finally {
      setEnviandoEvo(false)
    }
  }

  /** Salvar oferta */
  function handleSalvar(status: 'rascunho' | 'pronta' | 'enviada') {
    const oferta = adicionarOferta({
      produtoId: '',
      nomeProduto: form.nomeProduto,
      sku: form.sku,
      precoDe: parseFloat(form.precoDe) || 0,
      precoPor: parseFloat(form.precoPor) || 0,
      linkMercadoLivre: form.linkMercadoLivre,
      numeroWhatsApp: form.numeroWhatsApp,
      linkGrupo: form.linkGrupo,
      descricao: form.descricao,
      urgencia: form.urgencia,
      imagem: form.imagem,
      copyGerada,
      estiloCopy: estilo,
      status,
      favorita: false,
    })

    adicionarRegistro({
      ofertaId: oferta.id,
      produtoNome: form.nomeProduto,
      copyUsada: copyGerada,
      acao: status === 'enviada' ? 'enviada' : 'criada',
    })

    setSalvo(true)
    setTimeout(() => {
      navigate('/biblioteca')
    }, 1200)
  }

  const precoDe = parseFloat(form.precoDe) || 0
  const precoPor = parseFloat(form.precoPor) || 0
  const desconto = calcularDesconto(precoDe, precoPor)
  const formValido = form.nomeProduto && form.precoPor

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg hover:bg-[var(--color-surface-hover)] text-[var(--color-text-secondary)] transition-colors"
          aria-label="Voltar"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
            Nova Oferta
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Preencha os dados e gere a copy perfeita
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Formulário */}
        <div className="space-y-5">
          {/* Dados do produto */}
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 space-y-4">
            <h3 className="text-sm font-bold text-[var(--color-text-primary)] flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[var(--color-accent)]" />
              Dados do Produto
            </h3>

            <div className="space-y-3">
              {/* Nome */}
              <div>
                <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
                  Nome do Produto *
                </label>
                <input
                  type="text"
                  value={form.nomeProduto}
                  onChange={(e) => atualizarCampo('nomeProduto', e.target.value)}
                  placeholder="Ex: SSD Kingston 480GB"
                  className="
                    w-full px-3 py-2.5 rounded-lg text-sm
                    bg-[var(--color-bg-secondary)] border border-[var(--color-border)]
                    text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)]
                    focus:outline-none focus:border-[var(--color-accent)]
                    transition-all
                  "
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* SKU */}
                <div>
                  <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
                    SKU (opcional)
                  </label>
                  <input
                    type="text"
                    value={form.sku}
                    onChange={(e) => atualizarCampo('sku', e.target.value)}
                    placeholder="SA400S37/480G"
                    className="
                      w-full px-3 py-2.5 rounded-lg text-sm
                      bg-[var(--color-bg-secondary)] border border-[var(--color-border)]
                      text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)]
                      focus:outline-none focus:border-[var(--color-accent)]
                      transition-all
                    "
                  />
                </div>

                {/* Imagem URL */}
                <div>
                  <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
                    URL da Imagem
                  </label>
                  <input
                    type="url"
                    value={form.imagem}
                    onChange={(e) => atualizarCampo('imagem', e.target.value)}
                    placeholder="https://..."
                    className="
                      w-full px-3 py-2.5 rounded-lg text-sm
                      bg-[var(--color-bg-secondary)] border border-[var(--color-border)]
                      text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)]
                      focus:outline-none focus:border-[var(--color-accent)]
                      transition-all
                    "
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Preço De */}
                <div>
                  <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
                    Preço De (R$)
                  </label>
                  <input
                    type="number"
                    value={form.precoDe}
                    onChange={(e) => atualizarCampo('precoDe', e.target.value)}
                    placeholder="199.90"
                    step="0.01"
                    className="
                      w-full px-3 py-2.5 rounded-lg text-sm
                      bg-[var(--color-bg-secondary)] border border-[var(--color-border)]
                      text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)]
                      focus:outline-none focus:border-[var(--color-accent)]
                      transition-all
                    "
                  />
                </div>

                {/* Preço Por */}
                <div>
                  <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
                    Preço Por (R$) *
                  </label>
                  <input
                    type="number"
                    value={form.precoPor}
                    onChange={(e) => atualizarCampo('precoPor', e.target.value)}
                    placeholder="149.90"
                    step="0.01"
                    className="
                      w-full px-3 py-2.5 rounded-lg text-sm
                      bg-[var(--color-bg-secondary)] border border-[var(--color-border)]
                      text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)]
                      focus:outline-none focus:border-[var(--color-accent)]
                      transition-all
                    "
                  />
                </div>
              </div>

              {desconto > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-[var(--color-accent)] font-bold">
                    {desconto}% de desconto
                  </span>
                  <span className="text-[var(--color-text-secondary)]">
                    ({formatarPreco(precoDe)} → {formatarPreco(precoPor)})
                  </span>
                </div>
              )}

              {/* Link ML */}
              <div>
                <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
                  Link do Anúncio (Mercado Livre)
                </label>
                <input
                  type="url"
                  value={form.linkMercadoLivre}
                  onChange={(e) => atualizarCampo('linkMercadoLivre', e.target.value)}
                  placeholder="https://www.mercadolivre.com.br/..."
                  className="
                    w-full px-3 py-2.5 rounded-lg text-sm
                    bg-[var(--color-bg-secondary)] border border-[var(--color-border)]
                    text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)]
                    focus:outline-none focus:border-[var(--color-accent)]
                    transition-all
                  "
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* WhatsApp */}
                <div>
                  <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
                    Número WhatsApp
                  </label>
                  <input
                    type="tel"
                    value={form.numeroWhatsApp}
                    onChange={(e) => atualizarCampo('numeroWhatsApp', e.target.value)}
                    placeholder="11999999999"
                    className="
                      w-full px-3 py-2.5 rounded-lg text-sm
                      bg-[var(--color-bg-secondary)] border border-[var(--color-border)]
                      text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)]
                      focus:outline-none focus:border-[var(--color-accent)]
                      transition-all
                    "
                  />
                </div>

                {/* Link grupo */}
                <div>
                  <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
                    Link do Grupo
                  </label>
                  <input
                    type="url"
                    value={form.linkGrupo}
                    onChange={(e) => atualizarCampo('linkGrupo', e.target.value)}
                    placeholder="https://chat.whatsapp.com/..."
                    className="
                      w-full px-3 py-2.5 rounded-lg text-sm
                      bg-[var(--color-bg-secondary)] border border-[var(--color-border)]
                      text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)]
                      focus:outline-none focus:border-[var(--color-accent)]
                      transition-all
                    "
                  />
                </div>
              </div>

              {/* Descrição */}
              <div>
                <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
                  Descrição / Benefício (opcional)
                </label>
                <input
                  type="text"
                  value={form.descricao}
                  onChange={(e) => atualizarCampo('descricao', e.target.value)}
                  placeholder="Ex: Mais velocidade para seu PC"
                  className="
                    w-full px-3 py-2.5 rounded-lg text-sm
                    bg-[var(--color-bg-secondary)] border border-[var(--color-border)]
                    text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)]
                    focus:outline-none focus:border-[var(--color-accent)]
                    transition-all
                  "
                />
              </div>

              {/* Urgência */}
              <div>
                <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
                  Urgência / Escassez (opcional)
                </label>
                <input
                  type="text"
                  value={form.urgencia}
                  onChange={(e) => atualizarCampo('urgencia', e.target.value)}
                  placeholder="Ex: Últimas 5 unidades!"
                  className="
                    w-full px-3 py-2.5 rounded-lg text-sm
                    bg-[var(--color-bg-secondary)] border border-[var(--color-border)]
                    text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)]
                    focus:outline-none focus:border-[var(--color-accent)]
                    transition-all
                  "
                />
              </div>
            </div>
          </div>

          {/* Gerador de copy */}
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 space-y-4">
            <h3 className="text-sm font-bold text-[var(--color-text-primary)] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[var(--color-accent)]" />
              Gerador de Copy
            </h3>

            {/* Estilos */}
            <div className="grid grid-cols-3 gap-2">
              {estilosCopy.map((e) => {
                const Icone = e.icone
                return (
                  <button
                    key={e.valor}
                    onClick={() => setEstilo(e.valor)}
                    className={`
                      p-3 rounded-lg border text-center transition-all
                      ${
                        estilo === e.valor
                          ? 'border-[var(--color-accent)] bg-[var(--color-accent-soft)]'
                          : 'border-[var(--color-border)] hover:border-[var(--color-border-light)] hover:bg-[var(--color-surface-hover)]'
                      }
                    `}
                  >
                    <Icone
                      className={`w-5 h-5 mx-auto mb-1 ${
                        estilo === e.valor ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-secondary)]'
                      }`}
                    />
                    <span className={`block text-xs font-semibold ${
                      estilo === e.valor ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-primary)]'
                    }`}>
                      {e.label}
                    </span>
                    <span className="block text-[10px] text-[var(--color-text-secondary)] mt-0.5">
                      {e.descricao}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Botões de geração */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleGerarCopy}
                disabled={!formValido}
                className="
                  flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold
                  bg-[var(--color-accent)] text-[var(--color-text-inverse)]
                  hover:bg-[var(--color-accent-light)]
                  disabled:opacity-40 transition-all
                "
              >
                <Wand2 className="w-4 h-4" />
                Gerar Copy
              </button>
              <button
                onClick={handleGerarTresVersoes}
                disabled={!formValido}
                className="
                  flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold
                  border border-[var(--color-accent)] text-[var(--color-accent)]
                  hover:bg-[var(--color-accent-soft)]
                  disabled:opacity-40 transition-all
                "
              >
                <Sparkles className="w-4 h-4" />
                Gerar 3 Versões
              </button>
              {copyGerada && (
                <>
                  <button
                    onClick={() => setCopyGerada(encurtarCopy(copyGerada))}
                    className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] transition-all"
                  >
                    <Minimize2 className="w-3.5 h-3.5" />
                    Encurtar
                  </button>
                  <button
                    onClick={() => setCopyGerada(maisVendedor(copyGerada))}
                    className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] transition-all"
                  >
                    <TrendingUp className="w-3.5 h-3.5" />
                    + Vendedor
                  </button>
                  <button
                    onClick={() => setCopyGerada(maisPremium(copyGerada))}
                    className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] transition-all"
                  >
                    <Crown className="w-3.5 h-3.5" />
                    + Premium
                  </button>
                  <button
                    onClick={handleGerarCopy}
                    className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] transition-all"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Novo
                  </button>
                </>
              )}
            </div>

            {/* 3 versões tabs */}
            {tresVersoes && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-[var(--color-text-secondary)]">
                  Selecione uma versão:
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {estilosCopy.map((e) => (
                    <button
                      key={e.valor}
                      onClick={() => {
                        setEstilo(e.valor)
                        setCopyGerada(tresVersoes[e.valor])
                      }}
                      className={`
                        p-2 rounded-lg text-xs text-center border transition-all
                        ${
                          estilo === e.valor
                            ? 'border-[var(--color-accent)] bg-[var(--color-accent-soft)] text-[var(--color-accent)] font-semibold'
                            : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]'
                        }
                      `}
                    >
                      {e.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Copy gerada (editável) */}
            {copyGerada && (
              <div>
                <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
                  Copy gerada (editável):
                </label>
                <textarea
                  value={copyGerada}
                  onChange={(e) => setCopyGerada(e.target.value)}
                  rows={10}
                  className="
                    w-full px-3 py-2.5 rounded-lg text-sm leading-relaxed
                    bg-[var(--color-bg-secondary)] border border-[var(--color-border)]
                    text-[var(--color-text-primary)]
                    focus:outline-none focus:border-[var(--color-accent)]
                    transition-all resize-y font-mono
                  "
                />
              </div>
            )}
          </div>
        </div>

        {/* Preview e ações */}
        <div className="space-y-5">
          {/* Preview */}
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 space-y-4 sticky top-20">
            <h3 className="text-sm font-bold text-[var(--color-text-primary)] flex items-center gap-2">
              <Eye className="w-4 h-4 text-[var(--color-accent)]" />
              Preview da Oferta
            </h3>

            {/* Card preview */}
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] overflow-hidden">
              {/* Imagem */}
              {form.imagem && (
                <div className="aspect-video bg-[var(--color-bg-primary)]">
                  <img
                    src={form.imagem}
                    alt={form.nomeProduto}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="p-4 space-y-3">
                <h4 className="text-base font-bold text-[var(--color-text-primary)]">
                  {form.nomeProduto || 'Nome do produto'}
                </h4>

                <div className="flex items-baseline gap-3">
                  {precoDe > 0 && precoDe !== precoPor && (
                    <span className="price-old text-base">
                      {formatarPreco(precoDe)}
                    </span>
                  )}
                  <span className="price-new text-2xl">
                    {precoPor > 0 ? formatarPreco(precoPor) : 'R$ —'}
                  </span>
                  {desconto > 0 && (
                    <span className="badge badge--active text-xs">
                      -{desconto}%
                    </span>
                  )}
                </div>

                {form.sku && (
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    SKU: {form.sku}
                  </p>
                )}

                {/* Copy preview como mensagem WhatsApp */}
                {copyGerada && (
                  <div className="
                    p-3 rounded-lg
                    bg-[#005c4b]/30 border border-[#005c4b]/50
                    text-sm text-[var(--color-text-primary)]
                    whitespace-pre-wrap leading-relaxed
                  ">
                    {copyGerada}
                  </div>
                )}

                {/* Botão comprar */}
                {form.linkMercadoLivre && (
                  <a
                    href={form.linkMercadoLivre}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="
                      flex items-center justify-center gap-2 w-full py-3 rounded-lg
                      bg-[#ffe600] text-[#333] font-bold text-sm
                      hover:bg-[#ffd000] transition-all
                    "
                  >
                    Comprar no Mercado Livre
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>

            {/* Botões de ação */}
            {copyGerada && (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleCopiar}
                  className={`
                    flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold
                    border transition-all
                    ${
                      copiado
                        ? 'border-[var(--color-accent)] bg-[var(--color-accent-soft)] text-[var(--color-accent)]'
                        : 'border-[var(--color-border)] text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)]'
                    }
                  `}
                >
                  {copiado ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copiar
                    </>
                  )}
                </button>

                <button
                  onClick={handleAbrirWhatsApp}
                  className="
                    flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold
                    bg-[var(--color-whatsapp)] text-white
                    hover:brightness-110 transition-all
                  "
                >
                  <MessageSquare className="w-4 h-4" />
                  WhatsApp
                </button>

                <button
                  onClick={handleEnviarEvo}
                  disabled={enviandoEvo}
                  className="
                    flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold
                    bg-[var(--color-accent)] text-white
                    hover:brightness-110 transition-all disabled:opacity-50
                    col-span-2
                  "
                >
                  {enviandoEvo ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                  Enviar para Grupo (Automático)
                </button>

                <button
                  onClick={() => handleSalvar('rascunho')}
                  className="
                    flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm
                    border border-[var(--color-border)] text-[var(--color-text-secondary)]
                    hover:bg-[var(--color-surface-hover)] transition-all
                  "
                >
                  <Save className="w-4 h-4" />
                  Rascunho
                </button>

                <button
                  onClick={() => handleSalvar('enviada')}
                  className={`
                    flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold
                    transition-all
                    ${
                      salvo
                        ? 'bg-[var(--color-accent)] text-[var(--color-text-inverse)]'
                        : 'bg-[var(--color-accent)] text-[var(--color-text-inverse)] hover:bg-[var(--color-accent-light)]'
                    }
                  `}
                >
                  {salvo ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Salvo!
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Enviar e Salvar
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}


