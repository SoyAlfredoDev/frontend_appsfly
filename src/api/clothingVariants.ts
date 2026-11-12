import axios from './axios.js'

export type ClothingVariant = {
  sku: string
  options: { talla: string; color: string }
  initialStock: number
}

export type ClothingModel = {
  name: string
  sku: string
  categoryId: string
  price: number
}

export function saveClothingModel(parent: ClothingModel, variants: ClothingVariant[]) {
  return axios.post<{ createdCount: number; skippedCount: number }>('/products/variants/bulk', {
    parent,
    variants,
  })
}
