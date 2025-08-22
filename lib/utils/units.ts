import { Product, SaleUnit, UnitBase } from '../types';

const UNIT_CONVERSIONS: Record<SaleUnit, { base: UnitBase; multiplier: number }> = {
  kg: { base: 'g', multiplier: 1000 },
  g: { base: 'g', multiplier: 1 },
  '100g': { base: 'g', multiplier: 100 },
  pcs: { base: 'pcs', multiplier: 1 },
  pack: { base: 'pcs', multiplier: 1 }, // Handled specially via pack_bom
};

export function toBase(product: Product, qty: number, saleUnit: SaleUnit): number {
  if (saleUnit === 'pack' && product.pack_bom) {
    return qty * product.pack_bom.count;
  }
  
  const conversion = UNIT_CONVERSIONS[saleUnit];
  if (!conversion || conversion.base !== product.base_unit) {
    throw new Error(`Invalid unit conversion: ${saleUnit} for base unit ${product.base_unit}`);
  }
  
  return qty * conversion.multiplier;
}

export function fromBase(product: Product, baseQty: number, saleUnit: SaleUnit): number {
  if (saleUnit === 'pack' && product.pack_bom) {
    return baseQty / product.pack_bom.count;
  }
  
  const conversion = UNIT_CONVERSIONS[saleUnit];
  if (!conversion || conversion.base !== product.base_unit) {
    throw new Error(`Invalid unit conversion: ${saleUnit} for base unit ${product.base_unit}`);
  }
  
  return baseQty / conversion.multiplier;
}

export function saleUnitPrice(product: Product, saleUnit: SaleUnit): number {
  if (saleUnit === 'pack' && product.pack_bom) {
    return product.price_base * product.pack_bom.count;
  }
  
  const conversion = UNIT_CONVERSIONS[saleUnit];
  if (!conversion || conversion.base !== product.base_unit) {
    throw new Error(`Invalid unit conversion: ${saleUnit} for base unit ${product.base_unit}`);
  }
  
  return product.price_base * conversion.multiplier;
}

export function getUnitStep(saleUnit: SaleUnit, settings: any): number {
  switch (saleUnit) {
    case 'kg':
      return settings.kg_step || 0.05;
    case 'g':
    case '100g':
      return settings.g_step || 1;
    case 'pcs':
    case 'pack':
      return settings.pcs_step || 1;
    default:
      return 1;
  }
}

export function validateQuantity(qty: number, saleUnit: SaleUnit, settings: any): boolean {
  const step = getUnitStep(saleUnit, settings);
  return Math.abs((qty % step)) < 0.001; // Allow for floating point precision
}