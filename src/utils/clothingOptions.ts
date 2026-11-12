export const CLOTHING_VARIANTS_PATH = '/products_services/variants'

type VariantOptions = Record<string, unknown> | undefined

export function clothingOptions(options: VariantOptions) {
  const values = Object.entries(options ?? {})
  const get = (...keys: string[]) =>
    values.find(([name]) => keys.includes(name.trim().toLowerCase()))?.[1]
  const size = get('talla', 'size')
  const color = get('color')
  return {
    size: typeof size === 'string' ? size.trim().toLocaleUpperCase('es-CL') : '',
    color: typeof color === 'string' ? color.trim().toLocaleLowerCase('es-CL') : '',
  }
}
