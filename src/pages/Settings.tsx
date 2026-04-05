import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Save,
  Store,
  MessageSquare,
  CheckCircle,
  RefreshCw,
  Plug,
  ShieldCheck,
  AlertCircle,
  Unplug,
  Key,
  Globe,
  Settings as SettingsIcon,
  Zap,
  ArrowRight,
  Database,
  Smartphone,
} from 'lucide-react'
import { useSettingsStore } from '@/stores/settingsStore'
import { useProductStore } from '@/stores/productStore'
import { iniciarAutenticacaoML } from '@/services/mercadoLivreService'
import { testarConexaoEvolution } from '@/services/evolutionService'
import type { EstiloCopy } from '@/types'

export default function Settings() {
  const settings = useSettingsStore()
  const sincronizarReais = useProductStore((s) => s.sincronizarProdutosReais)
  const totalProdutos = useProductStore((s) => s.produtos.length)

  const [salvo, setSalvo] = useState(false)
  const [sincronizando, setSincronizando] = useState(false)
  const [testandoEvo, setTestandoEvo] = useState(false)
  const [evoStatus, setEvoStatus] = useState<'idle' | 'success' | 'error'>('idle')

  function handleSalvar() {
    setSalvo(true)
    setTimeout(() => setSalvo(false), 2000)
  }

  async function handleSincronizar() {
    setSincronizando(true)
    try {
      await sincronizarReais()
    } catch (err) {
      alert('Erro ao sincronizar produtos reais.')
    } finally {
      setSincronizando(false)
    }
  }

  function handleConectarML() {
    if (!settings.mlClientId || !settings.mlClientSecret) {
      alert('Configure Client ID e Secret.')
      return
    }
    iniciarAutenticacaoML({
      clientId: settings.mlClientId,
      clientSecret: settings.mlClientSecret,
      redirectUri: settings.mlRedirectUri || ''
    })
  }

  function handleDesconectarML() {
    if(!confirm('Deseja desconectar sua conta do Mercado Livre?')) return
    settings.atualizarConfig({
      mlConectado: false,
      mlSellerId: '',
      mlNomeLoja: '',
      mlUltimaSincronizacao: '',
      mlToken: undefined,
      mlRefreshToken: undefined,
    })
  }

  async function handleTestarEvo() {
    if (!settings.evoUrl || !settings.evoApiKey || !settings.evoInstanceName) {
      alert('Preencha os dados da API.')
      return
    }
    setTestandoEvo(true)
    setEvoStatus('idle')
    const ok = await testarConexaoEvolution(
      settings.evoUrl,
      settings.evoApiKey,
      settings.evoInstanceName
    )
    setEvoStatus(ok ? 'success' : 'error')
    setTestandoEvo(false)
  }

  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  }

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      className="max-w-[1200px] mx-auto pb-32 space-y-8"
    >
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-[var(--color-text-primary)]">
            Centro de <span className="text-[var(--color-accent)]">Comando</span>
          </h1>
          <p className="text-sm font-medium text-[var(--color-text-muted)] uppercase tracking-widest leading-none">
            Configurações e Integrações Torres High-End
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 items-start">
        {/* Coluna 1: Negócio e Automação */}
        <div className="space-y-8">
          {/* Identidade da Operação */}
          <motion.section variants={sectionVariants} className="p-8 rounded-[2rem] border border-[var(--color-border)] bg-[var(--color-surface)]/40 backdrop-blur-md space-y-6">
            <div className="flex items-center gap-3">
               <div className="w-1.5 h-6 bg-[var(--color-accent)] rounded-full" />
               <h3 className="text-lg font-black text-[var(--color-text-primary)]">Identidade da Operação</h3>
            </div>

            <div className="space-y-5">
               <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)] ml-1">Nome do Ecossistema</label>
                 <div className="relative">
                    <Store className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-accent)]" />
                    <input
                      type="text"
                      value={settings.nomeLoja}
                      onChange={(e) => settings.atualizarConfig({ nomeLoja: e.target.value })}
                      placeholder="Ex: Torres Digital"
                      className="w-full pl-12 pr-4 py-4 rounded-2xl bg-[var(--color-bg-primary)] border border-[var(--color-border)] text-sm font-bold text-white focus:border-[var(--color-accent)] transition-all"
                    />
                 </div>
               </div>

               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)] ml-1">WhatsApp de Suporte</label>
                    <div className="relative">
                       <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
                       <input
                        type="tel"
                        value={settings.numeroWhatsApp}
                        onChange={(e) => settings.atualizarConfig({ numeroWhatsApp: e.target.value })}
                        className="w-full pl-12 pr-4 py-4 rounded-2xl bg-[var(--color-bg-primary)] border border-[var(--color-border)] text-sm font-bold text-white focus:border-[var(--color-accent)] transition-all"
                       />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)] ml-1">Link do Grupo VIP</label>
                    <div className="relative">
                       <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
                       <input
                        type="url"
                        value={settings.linkGrupo}
                        onChange={(e) => settings.atualizarConfig({ linkGrupo: e.target.value })}
                        className="w-full pl-12 pr-4 py-4 rounded-2xl bg-[var(--color-bg-primary)] border border-[var(--color-border)] text-sm text-white focus:border-[var(--color-accent)] transition-all"
                       />
                    </div>
                  </div>
               </div>
            </div>
          </motion.section>

          {/* Motor de Automação Evolution */}
          <motion.section variants={sectionVariants} className="p-8 rounded-[2rem] border border-[var(--color-border)] bg-[var(--color-surface)] space-y-6 shadow-2xl">
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-3">
                  <div className="w-1.5 h-6 bg-emerald-500 rounded-full" />
                  <h3 className="text-lg font-black text-[var(--color-text-primary)]">Motor Evolution v2</h3>
               </div>
               <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-widest">
                  <Zap className="w-3 h-3 fill-current" /> Ativo
               </span>
            </div>

            <div className="space-y-4">
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)] ml-1">URL da Instância Deep</label>
                  <input
                    type="url"
                    value={settings.evoUrl}
                    onChange={(e) => settings.atualizarConfig({ evoUrl: e.target.value })}
                    placeholder="https://api.torres.com.br"
                    className="w-full px-5 py-4 rounded-2xl bg-[var(--color-bg-primary)] border border-[var(--color-border)] text-sm text-white focus:border-emerald-500 transition-all"
                  />
               </div>

               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)] ml-1">Chave de Acesso (API Key)</label>
                  <div className="relative">
                     <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                     <input
                      type="password"
                      value={settings.evoApiKey}
                      onChange={(e) => settings.atualizarConfig({ evoApiKey: e.target.value })}
                      className="w-full pl-12 pr-4 py-4 rounded-2xl bg-[var(--color-bg-primary)] border border-[var(--color-border)] text-sm text-white focus:border-emerald-500 transition-all font-mono"
                     />
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)] ml-1">Instância ID</label>
                    <input
                      type="text"
                      value={settings.evoInstanceName}
                      onChange={(e) => settings.atualizarConfig({ evoInstanceName: e.target.value })}
                      className="w-full px-5 py-4 rounded-2xl bg-[var(--color-bg-primary)] border border-[var(--color-border)] text-sm font-bold text-white focus:border-emerald-500 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)] ml-1">Grupo Alvo (JID)</label>
                    <input
                      type="text"
                      value={settings.evoGroupJid}
                      onChange={(e) => settings.atualizarConfig({ evoGroupJid: e.target.value })}
                      className="w-full px-5 py-4 rounded-2xl bg-[var(--color-bg-primary)] border border-[var(--color-border)] text-sm font-bold text-white focus:border-emerald-500 transition-all"
                    />
                  </div>
               </div>

               <button
                  onClick={handleTestarEvo}
                  disabled={testandoEvo}
                  className={`
                    w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3
                    ${evoStatus === 'success' ? 'bg-emerald-500 text-black' : 
                      evoStatus === 'error' ? 'bg-red-500 text-white' : 
                      'bg-[var(--color-bg-primary)] text-emerald-500 border border-emerald-500/30 hover:bg-emerald-500/10'}
                  `}
               >
                  {testandoEvo ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                  {testandoEvo ? 'VALIDANDO CONEXÃO...' : 
                   evoStatus === 'success' ? 'CONEXÃO ESTABELECIDA' :
                   evoStatus === 'error' ? 'FALHA NA CONEXÃO' : 'TESTAR MOTOR AGORA'}
               </button>
            </div>
          </motion.section>
        </div>

        {/* Coluna 2: Mercado Livre e Sistema */}
        <div className="space-y-8">
          {/* Integração Mercado Livre */}
          <motion.section variants={sectionVariants} className="p-8 rounded-[2rem] border border-[var(--color-border)] bg-[var(--color-gradient-gold)] text-black space-y-6 relative overflow-hidden">
             {/* Decor */}
             <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
             
             <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-3">
                   <div className="w-1.5 h-6 bg-black rounded-full" />
                   <h3 className="text-lg font-black text-black">Mercado Livre Pro</h3>
                </div>
                {settings.mlConectado ? (
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/20 text-black text-[10px] font-black uppercase tracking-widest">
                    <CheckCircle className="w-3 h-3" /> Conectado
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/10 text-black/60 text-[10px] font-black uppercase tracking-widest">
                    Pendente
                  </span>
                )}
             </div>

             <div className="space-y-4 relative z-10">
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-black/60 ml-1">App Client ID</label>
                   <input
                    type="text"
                    value={settings.mlClientId}
                    onChange={(e) => settings.atualizarConfig({ mlClientId: e.target.value })}
                    className="w-full px-5 py-4 rounded-2xl bg-black/10 border border-black/10 text-sm font-bold text-black focus:border-black transition-all"
                   />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-black/60 ml-1">App Client Secret</label>
                   <input
                    type="password"
                    value={settings.mlClientSecret}
                    onChange={(e) => settings.atualizarConfig({ mlClientSecret: e.target.value })}
                    className="w-full px-5 py-4 rounded-2xl bg-black/10 border border-black/10 text-sm font-bold text-black focus:border-black transition-all"
                   />
                </div>

                {settings.mlConectado ? (
                   <div className="pt-4 space-y-4">
                      <div className="p-4 rounded-2xl bg-black text-white space-y-3">
                         <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-white/40">
                            <span>Status da Conta</span>
                            <span>{settings.mlNomeLoja}</span>
                         </div>
                         <div className="text-lg font-black leading-none">Seller {settings.mlSellerId}</div>
                      </div>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={handleSincronizar}
                          disabled={sincronizando}
                          className="flex-1 py-4 rounded-2xl bg-black text-white text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all"
                        >
                          {sincronizando ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
                          {sincronizando ? 'SINCRONIZANDO...' : 'ATUALIZAR ACERVO'}
                        </button>
                        <button
                          onClick={handleDesconectarML}
                          className="p-4 rounded-2xl bg-red-600/20 text-red-700 hover:bg-red-600 hover:text-white transition-all"
                        >
                          <Unplug className="w-5 h-5" />
                        </button>
                      </div>
                   </div>
                ) : (
                  <button
                    onClick={handleConectarML}
                    className="w-full py-5 mt-4 rounded-2xl bg-black text-white text-xs font-black uppercase tracking-[0.25em] flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-2xl"
                  >
                    AUTORIZAR ACESSO <ArrowRight className="w-4 h-4" />
                  </button>
                )}
             </div>
          </motion.section>

          {/* Preferências de IA */}
          <motion.section variants={sectionVariants} className="p-8 rounded-[2rem] border border-[var(--color-border)] bg-[var(--color-surface)]/40 backdrop-blur-md space-y-6">
            <div className="flex items-center gap-3">
               <div className="w-1.5 h-6 bg-[var(--color-accent)] rounded-full" />
               <h3 className="text-lg font-black text-[var(--color-text-primary)]">Inteligência Padrão</h3>
            </div>

            <div className="grid grid-cols-3 gap-3">
               {([
                 { valor: 'vendedor' as EstiloCopy, label: 'FOGO', desc: 'DIRETO', color: 'text-orange-500' },
                 { valor: 'varejo' as EstiloCopy, label: 'ZAP', desc: 'POPULAR', color: 'text-emerald-500' },
                 { valor: 'premium' as EstiloCopy, label: 'ELITE', desc: 'ELEGANT', color: 'text-amber-500' },
               ]).map((e) => (
                 <button
                   key={e.valor}
                   onClick={() => settings.atualizarConfig({ estiloCopyPadrao: e.valor })}
                   className={`
                     p-4 rounded-2xl border text-center transition-all flex flex-col items-center gap-1
                     ${settings.estiloCopyPadrao === e.valor
                         ? 'border-[var(--color-accent)] bg-[var(--color-accent-soft)]'
                         : 'border-[var(--color-border)] hover:bg-[var(--color-surface-hover)]'}
                   `}
                 >
                   <span className={`block text-[10px] font-black uppercase tracking-tighter ${e.color}`}>{e.label}</span>
                   <span className="block text-[8px] font-black text-[var(--color-text-muted)] tracking-widest">{e.desc}</span>
                 </button>
               ))}
            </div>
          </motion.section>
        </div>
      </div>

      {/* Action Bar Flutuante */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-[500px] px-4 z-50">
         <motion.button
            layout
            onClick={handleSalvar}
            className={`
              w-full py-5 rounded-3xl font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-3 shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all
              ${salvo ? 'bg-emerald-500 text-black' : 'bg-[var(--color-accent)] text-black hover:scale-105 active:scale-95'}
            `}
         >
            {salvo ? <CheckCircle className="w-5 h-5" /> : <Save className="w-5 h-5" />}
            {salvo ? 'SISTEMA ATUALIZADO' : 'CONSOLIDAR ALTERAÇÕES'}
         </motion.button>
      </div>
    </motion.div>
  )
}
