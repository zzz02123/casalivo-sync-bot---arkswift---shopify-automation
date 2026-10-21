import { ArkSwiftRawItem, CleansedProduct, PricingConfig, WhitewashConfig } from '../types';

export const DEFAULT_WHITEWASH_CONFIG: WhitewashConfig = {
  brandName: 'Casalivo',
  skuPrefix: 'CSL-',
  vendorBlacklist: [
    'SPANISH AOSOM SL',
    'AOSOM',
    'Aosom',
    'HOMCOM',
    'Homcom',
    'OUTSUNNY',
    'Outsunny',
    'PAWHUT',
    'PawHut',
    'VINSETTO',
    'Vinsetto',
    'SOBUY',
    'SoBuy',
    'COSTWAY',
    'Costway',
    'KLEANKIN',
    'Kleankin',
    'DURHAND',
    'Durhand',
  ],
  bannedKeywords: [
    'Aosom',
    'Homcom',
    'Outsunny',
    'Pawhut',
    'Vinsetto',
    'SoBuy',
    'official store',
    'distributor warranty',
    'manufacturer warranty',
    'garantía del fabricante',
    'tienda oficial',
    'distribuidor oficial',
    'Aosom.es',
    'aosom.es',
    'www.aosom',
    'spanish warehouse',
    'almacén españa',
  ],
  wordReplacements: [
    { id: '1', from: 'HOMCOM', to: 'Casalivo' },
    { id: '2', from: 'Homcom', to: 'Casalivo' },
    { id: '3', from: 'OUTSUNNY', to: 'Casalivo' },
    { id: '4', from: 'Outsunny', to: 'Casalivo' },
    { id: '5', from: 'PAWHUT', to: 'Casalivo Pets' },
    { id: '6', from: 'PawHut', to: 'Casalivo Pets' },
    { id: '7', from: 'VINSETTO', to: 'Casalivo Office' },
    { id: '8', from: 'Vinsetto', to: 'Casalivo Office' },
    { id: '9', from: 'AOSOM', to: 'Casalivo' },
    { id: '10', from: 'Aosom', to: 'Casalivo' },
  ],
  safetyStockBuffer: 3,
  autoTags: ['Casalivo', 'HomeLiving', 'FreeShipping', 'VerifiedStock'],
  defaultCategory: 'Home & Living',
};

export const DEFAULT_PRICING_CONFIG: PricingConfig = {
  tiers: [
    { id: 'tier-1', name: 'Low Cost (< €20)', minCost: 0, maxCost: 20, multiplier: 2.5, flatFee: 0 },
    { id: 'tier-2', name: 'Mid Cost (€20 - €50)', minCost: 20, maxCost: 50, multiplier: 2.0, flatFee: 0 },
    { id: 'tier-3', name: 'High Cost (> €50)', minCost: 50, maxCost: 999999, multiplier: 1.8, flatFee: 0 },
  ],
  rounding: '99',
  compareAtMultiplier: 1.35,
  shippingFee: 0,
  taxRatePercent: 0,
};

/**
 * Calculates selling price, compare-at price, and profit margin
 */
export function calculatePricing(
  costPrice: number,
  config: PricingConfig = DEFAULT_PRICING_CONFIG
): {
  sellingPrice: number;
  compareAtPrice: number;
  profitAmount: number;
  profitMargin: number;
  appliedTier: string;
} {
  const cost = Number(costPrice) || 0;
  if (cost <= 0) {
    return {
      sellingPrice: 0,
      compareAtPrice: 0,
      profitAmount: 0,
      profitMargin: 0,
      appliedTier: 'None',
    };
  }

  // Find matching tier
  const tier = config.tiers.find((t) => cost >= t.minCost && cost < t.maxCost) || config.tiers[config.tiers.length - 1];

  let rawPrice = cost * tier.multiplier + tier.flatFee + config.shippingFee;
  if (config.taxRatePercent > 0) {
    rawPrice = rawPrice * (1 + config.taxRatePercent / 100);
  }

  // Rounding
  let finalPrice = rawPrice;
  if (config.rounding === '99') {
    finalPrice = Math.floor(rawPrice) + 0.99;
    if (finalPrice < rawPrice) finalPrice += 1;
  } else if (config.rounding === '95') {
    finalPrice = Math.floor(rawPrice) + 0.95;
    if (finalPrice < rawPrice) finalPrice += 1;
  } else if (config.rounding === 'integer') {
    finalPrice = Math.round(rawPrice);
  } else {
    finalPrice = Math.round(rawPrice * 100) / 100;
  }

  // Calculate compare-at price (MSRP)
  let rawCompareAt = finalPrice * (config.compareAtMultiplier || 1.35);
  let finalCompareAt = Math.floor(rawCompareAt) + 0.99;
  if (finalCompareAt <= finalPrice) {
    finalCompareAt = finalPrice + 10;
  }

  const profitAmount = Math.round((finalPrice - cost - config.shippingFee) * 100) / 100;
  const profitMargin = finalPrice > 0 ? Math.round((profitAmount / finalPrice) * 1000) / 10 : 0;

  return {
    sellingPrice: Math.round(finalPrice * 100) / 100,
    compareAtPrice: Math.round(finalCompareAt * 100) / 100,
    profitAmount,
    profitMargin,
    appliedTier: tier.name,
  };
}

/**
 * Cleanses product title removing sensitive brand words and applying brand replacements
 */
export function cleanseTitle(rawTitle: string, config: WhitewashConfig = DEFAULT_WHITEWASH_CONFIG): string {
  if (!rawTitle) return '';
  let title = rawTitle.trim();

  // Apply word replacements
  for (const rep of config.wordReplacements) {
    if (rep.from && rep.to !== undefined) {
      const regex = new RegExp(`\\b${escapeRegExp(rep.from)}\\b`, 'gi');
      title = title.replace(regex, rep.to);
    }
  }

  // Remove banned keywords
  for (const banned of config.bannedKeywords) {
    if (banned) {
      const regex = new RegExp(`\\b${escapeRegExp(banned)}\\b`, 'gi');
      title = title.replace(regex, '');
    }
  }

  // If title doesn't start with brandName, prepend brand if desired or clean up double spaces
  title = title.replace(/\s+/g, ' ').trim();
  title = title.replace(/^[-–|,\s]+|[-–|,\s]+$/g, '');

  if (!title.toLowerCase().includes(config.brandName.toLowerCase())) {
    title = `${config.brandName} - ${title}`;
  }

  return title;
}

/**
 * Cleanses product description HTML / text
 */
export function cleanseDescription(
  rawDesc: string = '',
  config: WhitewashConfig = DEFAULT_WHITEWASH_CONFIG
): string {
  if (!rawDesc) return `<p>Premium quality collection by <strong>${config.brandName}</strong>.</p>`;

  let desc = rawDesc;

  // Replace brands
  for (const rep of config.wordReplacements) {
    if (rep.from) {
      const regex = new RegExp(`\\b${escapeRegExp(rep.from)}\\b`, 'gi');
      desc = desc.replace(regex, rep.to);
    }
  }

  // Remove banned supplier links / emails / contact phrases
  for (const banned of config.bannedKeywords) {
    if (banned) {
      const regex = new RegExp(`\\b${escapeRegExp(banned)}\\b`, 'gi');
      desc = desc.replace(regex, '');
    }
  }

  // Remove supplier emails and URLs
  desc = desc.replace(/[\w.-]+@[\w.-]+\.\w+/gi, '');
  desc = desc.replace(/https?:\/\/[^\s<>"']+/gi, '');

  // Add Casalivo signature guarantee block at the end if not already present
  if (!desc.includes('Casalivo Guarantee')) {
    desc += `\n<div class="casalivo-guarantee" style="margin-top: 20px; padding: 15px; border-top: 1px solid #e2e8f0; font-size: 0.9em; color: #4a5568;">
      <p><strong>Casalivo Quality Assurance:</strong> Designed for modern European living. Carefully inspected, packaged, and dispatched with dedicated customer care.</p>
    </div>`;
  }

  return desc;
}

/**
 * Generates brand standardized SKU (e.g. CSL-01-0340)
 */
export function generateBrandSku(
  originalSku: string,
  config: WhitewashConfig = DEFAULT_WHITEWASH_CONFIG
): string {
  if (!originalSku) return `${config.skuPrefix}ITEM`;
  const cleanSku = originalSku.trim().replace(/\s+/g, '-').toUpperCase();
  if (cleanSku.startsWith(config.skuPrefix.toUpperCase())) {
    return cleanSku;
  }
  return `${config.skuPrefix}${cleanSku}`;
}

/**
 * Converts a raw ArkSwift item into a cleansed Casalivo product
 */
export function transformArkSwiftItem(
  item: ArkSwiftRawItem,
  whitewashConfig: WhitewashConfig = DEFAULT_WHITEWASH_CONFIG,
  pricingConfig: PricingConfig = DEFAULT_PRICING_CONFIG
): CleansedProduct {
  const brandSku = generateBrandSku(item.originalSku, whitewashConfig);
  const cleanTitleStr = cleanseTitle(item.originalTitle, whitewashConfig);
  const cleanDescHtml = cleanseDescription(item.description, whitewashConfig);
  const pricing = calculatePricing(item.originalPrice, pricingConfig);

  // Safety buffer calculation
  const buffer = whitewashConfig.safetyStockBuffer || 0;
  const rawStock = Number(item.stock) || 0;
  const availableStock = rawStock > buffer ? rawStock - buffer : 0;

  return {
    id: item.id || `item_${item.originalSku}`,
    sku: brandSku,
    originalSku: item.originalSku,
    title: cleanTitleStr,
    originalTitle: item.originalTitle,
    vendor: whitewashConfig.brandName,
    originalVendor: item.originalVendor || 'SPANISH AOSOM SL',
    costPrice: item.originalPrice,
    price: pricing.sellingPrice,
    compareAtPrice: pricing.compareAtPrice,
    profitMargin: pricing.profitMargin,
    profitAmount: pricing.profitAmount,
    stock: rawStock,
    availableStock,
    images: item.images && item.images.length > 0 ? item.images : [
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80',
    ],
    category: item.category || whitewashConfig.defaultCategory,
    tags: Array.from(new Set([...whitewashConfig.autoTags, item.category || 'Furniture'])),
    descriptionHtml: cleanDescHtml,
    status: availableStock > 0 ? 'active' : 'draft',
    syncStatus: 'idle',
  };
}

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
