export interface MarketList {
  id: string
  title: string
  created_at: string
  updated_at: string
}

export interface MarketItem {
  id: string
  name: string
  qty: number
  quantity: number // alias para qty (compatibilidade)
  unit?: string
  category?: string
  checked: boolean
  createdAt: Date | string
}
