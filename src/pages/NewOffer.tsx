import { useState, useEffect, useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Send,
  Wand2,
  RefreshCw,
  Minimize2,
  TrendingUp,
  Crown,
  Copy,
  ExternalLink,
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
import { copiarParaClipboard, abrirWhatsApp } from '@/lib/whatsappLink'
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

const estilosCopy: { valor: EstiloCopy; label: string; icone: any; descricao: string }[] = [
  { valor: 'vendedor', label: 'Vendedor', icone: Flame, descricao: 'Direto' },
  { valor: 'varejo', label: 'Varejo', icone: Zap, descricao: 'Promocional' },
  { valor: 'premium', label: 'Elite', icone: Crown, descricao: 'Elegante' },
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
        urgencia: produto.estoque <= 5 ? `Apenas ${produto.estoque} unidades disponíveis!` : '',
        imagem: produto.imagemPrincipal,
      })
    }
  }, [location.state, settings.numeroWhatsApp, settings.linkGrupo])

  const atualizarCampo = useCallback((campo: keyof FormularioOferta, valor: string) => {
    setForm((prev) => ({ ...prev, [campo]: valor }))
  }, [])

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

  function handleGerarCopy() {
    const copy = gerarCopy(estilo, dadosCopy())
    setCopyGerada(copy)
    setTresVersoes(null)
  }

  function handleGerarTresVersoes() {
    const versoes = gerarTresVersoes(dadosCopy())
    setTresVersoes(versoes)
    setCopyGerada(versoes[estilo])
  }

  async function handleCopiar() {
    const ok = await copiarParaClipboard(copyGerada)
    if (ok) {
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    }
  }

  function handleAbrirWhatsApp() {
    if (!form.numeroWhatsApp) {
       alert('Configure o número nas Configurações.')
       return
    }
    abrirWhatsApp(form.numeroWhatsApp, copyGerada)
  }

  async function handleEnviarEvo() {
    if (!settings.evoUrl || !settings.evoApiKey || !settings.evoInstanceName || !settings.evoGroupJid) {
      alert('Configure a Evolution API primeiro.')
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

      alert('Oferta disparada com sucesso!')
    } catch (error: any) {
      alert('Erro: ' + error.message)
    } finally {
      setEnviandoEvo(false)
    }
  }

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
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-[1400px] mx-auto pb-20 space-y-8"
    >
      {/* Header Premium */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-3 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-black text-[var(--color-text-primary)]">
            Editor de <span className="text-[var(--color-accent)]">Ofertas</span>
          </h1>
          <p className="text-sm font-medium text-[var(--color-text-muted)] uppercase tracking-widest">
             Criação Expressa Torres Premium
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 items-start">
        {/* Lado Esquerdo: Formulário */}
        <div className="space-y-6">
          <section className="p-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]/40 backdrop-blur-sm space-y-6">
            <div className="flex items-center gap-3">
               <div className="w-1.5 h-6 bg-[var(--color-accent)] rounded-full" />
               <h3 className="text-lg font-black text-[var(--color-text-primary)]">DNA do Produto</h3>
            </div>

            <div className="space-y-4">
               <div>
                  <label className="text-[10px] uppercase font-black text-[var(--color-text-muted)] mb-2 block tracking-widest">Identidade Visual</label>
                  <input
                    type="text"
                    value={form.nomeProduto}
                    onChange={(e) => atualizarCampo('nomeProduto', e.target.value)}
                    placeholder="Nome do Produto"
                    className="w-full px-4 py-3.5 rounded-xl bg-[var(--color-bg-primary)] border border-[var(--color-border)] text-sm font-bold focus:border-[var(--color-accent)] transition-all"
                  />
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    value={form.sku}
                    onChange={(e) => atualizarCampo('sku', e.target.value)}
                    placeholder="SKU"
                    className="w-full px-4 py-3.5 rounded-xl bg-[var(--color-bg-primary)] border border-[var(--color-border)] text-sm focus:border-[var(--color-accent)] transition-all"
                  />
                  <input
                    type="url"
                    value={form.imagem}
                    onChange={(e) => atualizarCampo('imagem', e.target.value)}
                    placeholder="URL da Imagem"
                    className="w-full px-4 py-3.5 rounded-xl bg-[var(--color-bg-primary)] border border-[var(--color-border)] text-sm focus:border-[var(--color-accent)] transition-all"
                  />
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[var(--color-text-muted)] ml-1">Preço Original (De)</label>
                    <input
                      type="number"
                      value={form.precoDe}
                      onChange={(e) => atualizarCampo('precoDe', e.target.value)}
                      placeholder="0.00"
                      className="w-full px-4 py-3.5 rounded-xl bg-[var(--color-bg-primary)] border border-[var(--color-border)] text-sm font-bold focus:border-[var(--color-accent)]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[var(--color-accent)] ml-1">Preço Oferta (Por)</label>
                    <input
                      type="number"
                      value={form.precoPor}
                      onChange={(e) => atualizarCampo('precoPor', e.target.value)}
                      placeholder="0.00"
                      className="w-full px-4 py-3.5 rounded-xl bg-[var(--color-bg-primary)] border border-[var(--color-accent)] text-sm font-black text-[var(--color-accent)]"
                    />
                  </div>
               </div>
            </div>
          </section>

          {/* IA Copy Engine */}
          <section className="p-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] space-y-6">
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-3">
                  <div className="w-1.5 h-6 bg-[var(--color-accent)] rounded-full" />
                  <h3 className="text-lg font-black text-[var(--color-text-primary)]">IA Copywriter</h3>
               </div>
               <div className="flex gap-1">
                  {estilosCopy.map((e) => (
                    <button 
                      key={e.valor}
                      onClick={() => setEstilo(e.valor)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tighter transition-all ${estilo === e.valor ? 'bg-[var(--color-accent)] text-black' : 'bg-[var(--color-bg-primary)] text-[var(--color-text-muted)]'}`}
                    >
                      {e.label}
                    </button>
                  ))}
               </div>
            </div>

            <div className="flex flex-wrap gap-3">
               <button
                  onClick={handleGerarCopy}
                  disabled={!formValido}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-[var(--color-gradient-gold)] text-black font-black text-sm shadow-xl hover:scale-[1.02] active:scale-95 disabled:opacity-30 transition-all"
               >
                  <Wand2 className="w-5 h-5" />
                  Gerar Copy Perfeita
               </button>
               <button
                  onClick={handleGerarTresVersoes}
                  disabled={!formValido}
                  className="px-6 py-4 rounded-xl border-2 border-[var(--color-accent)] text-[var(--color-accent)] font-black text-sm hover:bg-[var(--color-accent-soft)] transition-all"
               >
                  Testar Variantes
               </button>
            </div>

            {copyGerada && (
               <motion.div 
                 initial={{ opacity: 0, height: 0 }}
                 animate={{ opacity: 1, height: 'auto' }}
                 className="space-y-4 pt-4 border-t border-[var(--color-border)]"
               >
                  <textarea
                    value={copyGerada}
                    onChange={(e) => setCopyGerada(e.target.value)}
                    rows={8}
                    className="w-full px-4 py-4 rounded-xl bg-[var(--color-bg-primary)] border border-[var(--color-border)] text-sm leading-relaxed font-mono focus:border-[var(--color-accent)]"
                  />
                  <div className="flex flex-wrap gap-2">
                     <button onClick={() => setCopyGerada(encurtarCopy(copyGerada))} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[var(--color-surface)] text-[10px] font-bold text-[var(--color-text-secondary)] border border-[var(--color-border)] hover:text-[var(--color-accent)] transition-colors"><Minimize2 className="w-3 h-3"/> Compactar</button>
                     <button onClick={() => setCopyGerada(maisVendedor(copyGerada))} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[var(--color-surface)] text-[10px] font-bold text-[var(--color-text-secondary)] border border-[var(--color-border)] hover:text-[var(--color-accent)] transition-colors"><Flame className="w-3 h-3"/> + Conversão</button>
                     <button onClick={() => setCopyGerada(maisPremium(copyGerada))} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[var(--color-surface)] text-[10px] font-bold text-[var(--color-text-secondary)] border border-[var(--color-border)] hover:text-[var(--color-accent)] transition-colors"><Crown className="w-3 h-3"/> + Premium</button>
                  </div>
               </motion.div>
            )}
          </section>
        </div>

        {/* Lado Direito: Preview Mobile Realtime */}
        <div className="sticky top-24 space-y-6">
           <div className="relative mx-auto w-full max-w-[340px] aspect-[9/18.5] bg-black rounded-[3rem] border-[8px] border-[#1a1a1a] shadow-2xl overflow-hidden">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-[#1a1a1a] rounded-b-2xl z-20" />
              
              <div className="h-full w-full bg-[var(--color-bg-primary)] overflow-y-auto custom-scrollbar pt-8">
                 {form.imagem && (
                   <div className="relative aspect-square">
                      <img src={form.imagem} className="w-full h-full object-cover" />
                      <div className="absolute top-4 right-4 bg-red-600 text-white text-[10px] font-black px-2 py-1 rounded-full shadow-lg">⚡ OFERTA LIMITADA</div>
                   </div>
                 )}
                 
                 <div className="p-5 space-y-4">
                    <h2 className="text-lg font-black text-white leading-tight">{form.nomeProduto || 'Título da Oferta'}</h2>
                    
                    <div className="flex items-baseline gap-2">
                       {precoDe > 0 && precoDe !== precoPor && <span className="text-xs line-through text-gray-500">{formatarPreco(precoDe)}</span>}
                       <span className="text-2xl font-black text-[var(--color-accent)]">{formatarPreco(precoPor)}</span>
                    </div>

                    {copyGerada && (
                       <div className="p-3 bg-[#075e54]/20 border-l-4 border-[#25d366] text-[11px] text-gray-200 whitespace-pre-wrap leading-relaxed rounded-r-lg font-mono">
                          {copyGerada}
                       </div>
                    )}
                 </div>
              </div>

              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[85%] z-20">
                 <button className="w-full py-3.5 bg-[#25d366] text-white rounded-2xl font-black text-xs shadow-2xl flex items-center justify-center gap-2">
                    <MessageSquare className="w-4 h-4 fill-white" />
                    EU QUERO AGORA
                 </button>
              </div>
           </div>

           <div className="grid grid-cols-2 gap-3 max-w-[340px] mx-auto">
              <button 
                onClick={handleCopiar} 
                className={`flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-xs border-2 transition-all ${copiado ? 'border-[var(--color-accent)] text-[var(--color-accent)]' : 'border-[var(--color-border)] text-white'}`}
              >
                {copiado ? <CheckCircle className="w-4 h-4"/> : <Copy className="w-4 h-4"/>}
                {copiado ? 'COPIADO' : 'COPIAR TEXTO'}
              </button>
              <button onClick={handleAbrirWhatsApp} className="flex items-center justify-center gap-2 py-4 rounded-2xl bg-[#075e54] text-white font-black text-xs">
                 <MessageSquare className="w-4 h-4"/>
                 WPP MANUAL
              </button>
              <button 
                onClick={handleEnviarEvo}
                disabled={enviandoEvo || !copyGerada}
                className="col-span-2 py-5 rounded-2xl bg-[var(--color-accent)] text-black font-black text-sm shadow-[0_0_25px_rgba(212,175,55,0.3)] hover:scale-[1.02] active:scale-95 disabled:opacity-30 transition-all flex items-center justify-center gap-3"
              >
                 {enviandoEvo ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5 fill-black" />}
                 DISPARAR NO GRUPO PRO
              </button>
              <button onClick={() => handleSalvar('rascunho')} className="col-span-2 py-4 rounded-xl border border-[var(--color-border)] text-[var(--color-text-muted)] font-bold text-xs uppercase tracking-widest hover:text-white transition-colors">
                 Salvar Rascunho na Biblioteca
              </button>
           </div>
        </div>
      </div>
    </motion.div>
  )
}
