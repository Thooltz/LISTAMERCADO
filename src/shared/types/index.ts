export interface User {
  uid: string
  email: string | null
}

export interface MarketItem {
  id: string
  name: string
  qty: number
  checked: boolean
  createdAt: Date
}
