/**
 * Configurações — Dados da loja, WhatsApp, integração ML e Evolution API
 */
import { useState } from 'react'
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
      alert('Erro ao sincronizar produtos reais. Verifique seu token.')
    } finally {
      setSincronizando(false)
    }
  }

  function handleConectarML() {
    if (!settings.mlClientId || !settings.mlClientSecret) {
      alert('Configure o Client ID e Client Secret antes de conectar.')
      return
    }
    iniciarAutenticacaoML({
      clientId: settings.mlClientId,
      clientSecret: settings.mlClientSecret,
      redirectUri: settings.mlRedirectUri || ''
    })
  }

  function handleDesconectarML() {
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
      alert('Preencha os dados da Evolution API para testar.')
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

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl pb-20">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
          Configurações
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">
          Gerencie as integrações e preferências do seu painel
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Lado Esquerdo: Loja e Preferências */}
        <div className="space-y-6">
          {/* Dados da loja */}
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 space-y-4">
            <h3 className="text-sm font-bold text-[var(--color-text-primary)] flex items-center gap-2">
              <Store className="w-4 h-4 text-[var(--color-accent)]" />
              Dados da Loja
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
                  Nome da Loja
                </label>
                <input
                  type="text"
                  value={settings.nomeLoja}
                  onChange={(e) => settings.atualizarConfig({ nomeLoja: e.target.value })}
                  placeholder="Minha Loja Tech"
                  className="w-full px-3 py-2.5 rounded-lg text-sm bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent)] transition-all"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
                    WhatsApp (Manual)
                  </label>
                  <input
                    type="tel"
                    value={settings.numeroWhatsApp}
                    onChange={(e) => settings.atualizarConfig({ numeroWhatsApp: e.target.value })}
                    placeholder="11999999999"
                    className="w-full px-3 py-2.5 rounded-lg text-sm bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent)] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
                    Link do Grupo
                  </label>
                  <input
                    type="url"
                    value={settings.linkGrupo}
                    onChange={(e) => settings.atualizarConfig({ linkGrupo: e.target.value })}
                    placeholder="https://chat.whatsapp.com/..."
                    className="w-full px-3 py-2.5 rounded-lg text-sm bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent)] transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Preferências de Copy */}
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 space-y-4">
            <h3 className="text-sm font-bold text-[var(--color-text-primary)] flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[var(--color-accent)]" />
              Estilo de Copy Padrão
            </h3>

            <div className="grid grid-cols-3 gap-2">
              {([
                { valor: 'vendedor' as EstiloCopy, label: '🔥 Vendedor', desc: 'Direto' },
                { valor: 'varejo' as EstiloCopy, label: '💥 Varejo', desc: 'Popular' },
                { valor: 'premium' as EstiloCopy, label: '🧠 Premium', desc: 'Elegante' },
              ]).map((e) => (
                <button
                  key={e.valor}
                  onClick={() => settings.atualizarConfig({ estiloCopyPadrao: e.valor })}
                  className={`
                    p-2 rounded-lg border text-center transition-all
                    ${
                      settings.estiloCopyPadrao === e.valor
                        ? 'border-[var(--color-accent)] bg-[var(--color-accent-soft)]'
                        : 'border-[var(--color-border)] hover:bg-[var(--color-surface-hover)]'
                    }
                  `}
                >
                  <span className="block text-xs font-bold text-[var(--color-text-primary)]">{e.label}</span>
                  <span className="block text-[10px] text-[var(--color-text-secondary)]">{e.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Integração Evolution API */}
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 space-y-4">
            <h3 className="text-sm font-bold text-[var(--color-text-primary)] flex items-center gap-2">
              <Zap className="w-4 h-4 text-[var(--color-accent)]" />
              Automação WhatsApp (Evolution v2)
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
                  URL da API (ex: https://api.meudominio.com)
                </label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-secondary)]" />
                  <input
                    type="url"
                    value={settings.evoUrl}
                    onChange={(e) => settings.atualizarConfig({ evoUrl: e.target.value })}
                    className="w-full pl-9 pr-3 py-2.5 rounded-lg text-sm bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent)] transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
                  API Key (Global ou da Instância)
                </label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-secondary)]" />
                  <input
                    type="password"
                    value={settings.evoApiKey}
                    onChange={(e) => settings.atualizarConfig({ evoApiKey: e.target.value })}
                    className="w-full pl-9 pr-3 py-2.5 rounded-lg text-sm bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent)] transition-all"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
                    Nome da Instância
                  </label>
                  <input
                    type="text"
                    value={settings.evoInstanceName}
                    onChange={(e) => settings.atualizarConfig({ evoInstanceName: e.target.value })}
                    placeholder="ex: User01"
                    className="w-full px-3 py-2.5 rounded-lg text-sm bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent)] transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
                    JID do Grupo (Destino)
                  </label>
                  <input
                    type="text"
                    value={settings.evoGroupJid}
                    onChange={(e) => settings.atualizarConfig({ evoGroupJid: e.target.value })}
                    placeholder="123456789@g.us"
                    className="w-full px-3 py-2.5 rounded-lg text-sm bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent)] transition-all"
                  />
                </div>
              </div>

              <button
                onClick={handleTestarEvo}
                disabled={testandoEvo}
                className={`
                  flex items-center justify-center gap-2 w-full py-2 rounded-lg text-xs font-bold transition-all
                  ${
                    evoStatus === 'success' ? 'bg-[var(--color-success-soft)] text-[var(--color-success)]' :
                    evoStatus === 'error' ? 'bg-[var(--color-danger-soft)] text-[var(--color-danger)]' :
                    'bg-[var(--color-surface-hover)] text-[var(--color-text-primary)] hover:brightness-110'
                  }
                `}
              >
                {testandoEvo ? <RefreshCw className="w-3 h-3 animate-spin" /> : <ShieldCheck className="w-3 h-3" />}
                {testandoEvo ? 'Testando...' : 
                 evoStatus === 'success' ? 'Conexão OK!' :
                 evoStatus === 'error' ? 'Falha na Conexão' : 'Testar Conexão'}
              </button>
            </div>
          </div>
        </div>

        {/* Lado Direito: Mercado Livre API */}
        <div className="space-y-6">
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 space-y-4">
            <h3 className="text-sm font-bold text-[var(--color-text-primary)] flex items-center gap-2">
              <SettingsIcon className="w-4 h-4 text-[var(--color-accent)]" />
              Credenciais Mercado Livre (App)
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
                  Client ID
                </label>
                <input
                  type="text"
                  value={settings.mlClientId}
                  onChange={(e) => settings.atualizarConfig({ mlClientId: e.target.value })}
                  placeholder="ID da sua aplicação no ML"
                  className="w-full px-3 py-2.5 rounded-lg text-sm bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent)] transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
                  Client Secret
                </label>
                <input
                  type="password"
                  value={settings.mlClientSecret}
                  onChange={(e) => settings.atualizarConfig({ mlClientSecret: e.target.value })}
                  placeholder="Secret da sua aplicação"
                  className="w-full px-3 py-2.5 rounded-lg text-sm bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent)] transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
                  Redirect URI (Configurada no Portal ML)
                </label>
                <input
                  type="text"
                  readOnly
                  value={settings.mlRedirectUri}
                  className="w-full px-3 py-2.5 rounded-lg text-sm bg-[var(--color-bg-primary)] border border-[var(--color-border)] text-[var(--color-text-muted)] cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 space-y-4">
            <h3 className="text-sm font-bold text-[var(--color-text-primary)] flex items-center gap-2">
              <Plug className="w-4 h-4 text-[var(--color-accent)]" />
              Status da Integração ML
            </h3>

            {settings.mlConectado ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--color-success-soft)] border border-[var(--color-accent-soft)]">
                  <ShieldCheck className="w-5 h-5 text-[var(--color-accent)]" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-[var(--color-accent)]">Conectado</p>
                    <p className="text-xs text-[var(--color-text-secondary)]">Conta vinculada com sucesso</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-[10px]">
                  <div className="p-2 rounded bg-[var(--color-bg-secondary)]">
                    <span className="text-[var(--color-text-secondary)]">Seller ID:</span>
                    <p className="font-mono mt-0.5">{settings.mlSellerId}</p>
                  </div>
                  <div className="p-2 rounded bg-[var(--color-bg-secondary)]">
                    <span className="text-[var(--color-text-secondary)]">Nickname:</span>
                    <p className="mt-0.5">{settings.mlNomeLoja}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleSincronizar}
                    disabled={sincronizando}
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold bg-[var(--color-accent)] text-white hover:brightness-110 disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3 h-3 ${sincronizando ? 'animate-spin' : ''}`} />
                    {sincronizando ? 'Sincronizando...' : 'Sincronizar Agora'}
                  </button>
                  <button
                    onClick={handleDesconectarML}
                    className="flex items-center justify-center p-2 rounded-lg border border-[var(--color-danger)] text-[var(--color-danger)] hover:bg-[var(--color-danger-soft)]"
                  >
                    <Unplug className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <AlertCircle className="w-10 h-10 text-[var(--color-warning)] mx-auto mb-3" />
                <p className="text-sm font-bold text-[var(--color-text-primary)]">Conta não conectada</p>
                <p className="text-xs text-[var(--color-text-secondary)] mb-4">Inicie o login para buscar produtos reais</p>
                <button
                  onClick={handleConectarML}
                  className="w-full py-2.5 rounded-lg text-sm font-bold bg-[#ffe600] text-[#333] hover:bg-[#ffd000]"
                >
                  Conectar Mercado Livre
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Fixo de Ação */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-[var(--color-surface)] border-t border-[var(--color-border)] lg:left-[var(--sidebar-width)] z-30">
        <div className="max-w-4xl mx-auto flex justify-end">
          <button
            onClick={handleSalvar}
            className={`
              flex items-center gap-2 px-8 py-3 rounded-lg font-bold transition-all
              ${
                salvo
                  ? 'bg-[var(--color-accent)] text-white'
                  : 'bg-[var(--color-accent)] text-white hover:scale-105 active:scale-95'
              }
            `}
          >
            {salvo ? <CheckCircle className="w-5 h-5" /> : <Save className="w-5 h-5" />}
            {salvo ? 'Configurações Salvas!' : 'Salvar Alterações'}
          </button>
        </div>
      </div>
    </div>
  )
}
