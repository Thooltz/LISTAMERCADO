/**
 * Converte string de dinheiro brasileiro (ex: "12,50", "12", ",50") para number
 * Retorna null se o valor for inválido ou vazio
 * 
 * Funcionalidades:
 * - Remove separadores de milhar
 * - Troca vírgula por ponto
 * - Trata vazio como null
 * - Evita NaN
 */
export function parseBRMoneyToNumber(value: string): number | null {
  if (!value || value.trim() === '') {
    return null
  }

  // Remove tudo exceto dígitos, vírgula e ponto
  // Permite ponto como separador de milhar (ex: "1.234,50")
  let cleaned = value.replace(/[^\d,.]/g, '')
  
  // Se só tem vírgula/ponto ou está vazio, retorna null
  if (cleaned === '' || cleaned === ',' || cleaned === '.') {
    return null
  }

  // Se tem ponto e vírgula, assume que ponto é milhar e vírgula é decimal
  // Ex: "1.234,50" -> "1234.50"
  if (cleaned.includes('.') && cleaned.includes(',')) {
    // Remove pontos (milhar) e troca vírgula por ponto (decimal)
    cleaned = cleaned.replace(/\./g, '').replace(',', '.')
  } else if (cleaned.includes(',')) {
    // Só tem vírgula, troca por ponto
    cleaned = cleaned.replace(',', '.')
  }
  // Se só tem ponto, assume que é decimal (já está correto)

  const parsed = parseFloat(cleaned)

  // Retorna null se não for um número válido
  if (isNaN(parsed) || parsed < 0) {
    return null
  }

  return parsed
}

/**
 * Formata número para string de dinheiro brasileiro (ex: 12.5 -> "12,50")
 * Retorna string vazia se o valor for null ou inválido
 */
export function formatNumberToBRMoney(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) {
    return ''
  }

  // Formata com 2 casas decimais e substitui ponto por vírgula
  return value.toFixed(2).replace('.', ',')
}
