export interface User {
  id: string
  email: string
}

export interface List {
  id: string
  user_id: string
  title: string
  items: any[] // jsonb array
  created_at: string
  updated_at: string
}

export interface Item {
  id: string
  user_id: string
  list_id: string
  name: string
  quantity: number
  unit: string
  category: string
  price: number | null
  checked: boolean
  created_at: string
  updated_at: string
}

export interface CreateListInput {
  title: string
}

export interface UpdateListInput {
  title?: string
}

export interface CreateItemInput {
  list_id: string
  name: string
  quantity?: number
  unit?: string
  category?: string
  price?: number
}

export interface UpdateItemInput {
  name?: string
  quantity?: number
  unit?: string
  category?: string
  price?: number
  checked?: boolean
}
