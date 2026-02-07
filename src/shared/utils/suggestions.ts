// Sugestões de categorias e unidades baseadas no nome do item
const suggestions: Record<string, { category: string; unit: string }> = {
  // Alimentos básicos
  arroz: { category: 'Alimentos', unit: 'kg' },
  feijão: { category: 'Alimentos', unit: 'kg' },
  açúcar: { category: 'Alimentos', unit: 'kg' },
  sal: { category: 'Alimentos', unit: 'kg' },
  farinha: { category: 'Alimentos', unit: 'kg' },
  macarrão: { category: 'Alimentos', unit: 'un' },
  óleo: { category: 'Alimentos', unit: 'L' },
  azeite: { category: 'Alimentos', unit: 'L' },
  vinagre: { category: 'Alimentos', unit: 'L' },

  // Laticínios
  leite: { category: 'Laticínios', unit: 'L' },
  queijo: { category: 'Laticínios', unit: 'kg' },
  manteiga: { category: 'Laticínios', unit: 'un' },
  iogurte: { category: 'Laticínios', unit: 'un' },
  requeijão: { category: 'Laticínios', unit: 'un' },

  // Carnes
  carne: { category: 'Carnes', unit: 'kg' },
  frango: { category: 'Carnes', unit: 'kg' },
  peixe: { category: 'Carnes', unit: 'kg' },
  linguiça: { category: 'Carnes', unit: 'kg' },
  bacon: { category: 'Carnes', unit: 'kg' },

  // Hortifruti
  tomate: { category: 'Hortifruti', unit: 'kg' },
  cebola: { category: 'Hortifruti', unit: 'kg' },
  alho: { category: 'Hortifruti', unit: 'kg' },
  batata: { category: 'Hortifruti', unit: 'kg' },
  banana: { category: 'Hortifruti', unit: 'kg' },
  maçã: { category: 'Hortifruti', unit: 'kg' },
  laranja: { category: 'Hortifruti', unit: 'kg' },

  // Limpeza
  sabão: { category: 'Limpeza', unit: 'un' },
  detergente: { category: 'Limpeza', unit: 'un' },
  água: { category: 'Limpeza', unit: 'L' },
  sabonete: { category: 'Limpeza', unit: 'un' },
  shampoo: { category: 'Limpeza', unit: 'un' },
  papel: { category: 'Limpeza', unit: 'un' },

  // Bebidas
  refrigerante: { category: 'Bebidas', unit: 'L' },
  cerveja: { category: 'Bebidas', unit: 'un' },
  suco: { category: 'Bebidas', unit: 'L' },
  água: { category: 'Bebidas', unit: 'L' },
}

export function getSuggestion(name: string): { category: string; unit: string } | null {
  const normalized = name.toLowerCase().trim()
  
  // Busca exata
  if (suggestions[normalized]) {
    return suggestions[normalized]
  }

  // Busca parcial
  for (const [key, value] of Object.entries(suggestions)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return value
    }
  }

  return null
}

export function getDefaultCategory(): string {
  return 'Outros'
}

export function getDefaultUnit(): string {
  return 'un'
}
