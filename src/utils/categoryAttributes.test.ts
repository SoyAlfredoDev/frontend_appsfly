import { describe, expect, it } from 'vitest'
import { categoryAttributeKey } from './categoryAttributes'

describe('categoryAttributeKey', () => {
  it('preserves the base letters in accented product attribute labels', () => {
    expect(categoryAttributeKey(' Terminación y diámetro ')).toBe('terminacion_y_diametro')
    expect(categoryAttributeKey('Largo (mm)')).toBe('largo_mm')
  })
})
