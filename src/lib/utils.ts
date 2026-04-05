/**
 * Utilitários gerais do sistema
 */
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** Combina classes com merge inteligente do Tailwind */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Formata valor em Reais (BRL) */
export function formatarPreco(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor)
}

/** Formata data para exibição */
export function formatarData(data: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(data))
}

/** Formata data com hora */
export function formatarDataHora(data: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(data))
}

/** Calcula desconto percentual */
export function calcularDesconto(precoDe: number, precoPor: number): number {
  if (precoDe <= 0) return 0
  return Math.round(((precoDe - precoPor) / precoDe) * 100)
}

/** Gera ID único */
export function gerarId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

/** Trunca texto com reticências */
export function truncarTexto(texto: string, max: number): string {
  if (texto.length <= max) return texto
  return texto.substring(0, max).trim() + '...'
}

/** Data de hoje em ISO */
export function hojeISO(): string {
  return new Date().toISOString().split('T')[0]
}

/** Verifica se uma data é de hoje */
export function ehHoje(data: string): boolean {
  return data.startsWith(hojeISO())
}
