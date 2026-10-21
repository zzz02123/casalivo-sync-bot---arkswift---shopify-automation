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

export interface TaxonomyMapping {
  englishCategory: string;
  shopifyCategory: string; // Level 1-2 or full taxonomy path
  topLevelCategory: string; // Level 1-2
  googleProductCategory: string;
  spanishType: string;
}

export const AOSOM_TAXONOMY_MAP: Record<string, TaxonomyMapping> = {
  greenhouse: {
    englishCategory: 'Greenhouse',
    shopifyCategory: 'Home & Garden > Lawn & Garden > Gardening > Greenhouses',
    topLevelCategory: 'Home & Garden > Lawn & Garden',
    googleProductCategory: 'Home & Garden > Lawn & Garden > Gardening > Greenhouses',
    spanishType: 'Invernaderos y Jardín',
  },
  nightstands: {
    englishCategory: 'Nightstands',
    shopifyCategory: 'Furniture > Bedroom Furniture > Nightstands',
    topLevelCategory: 'Furniture > Bedroom Furniture',
    googleProductCategory: 'Furniture > Bedroom Furniture > Nightstands',
    spanishType: 'Mesitas de Noche',
  },
  'other outdoor furniture': {
    englishCategory: 'Other Outdoor Furniture',
    shopifyCategory: 'Furniture > Outdoor Furniture',
    topLevelCategory: 'Furniture > Outdoor Furniture',
    googleProductCategory: 'Furniture > Outdoor Furniture',
    spanishType: 'Muebles de Exterior',
  },
  'storage trolleys': {
    englishCategory: 'Storage Trolleys',
    shopifyCategory: 'Furniture > Carts & Islands > Kitchen & Dining Carts',
    topLevelCategory: 'Home & Garden > Household Supplies',
    googleProductCategory: 'Home & Garden > Household Supplies > Storage & Organization',
    spanishType: 'Carritos de Almacenaje',
  },
  'trash cans': {
    englishCategory: 'Trash Cans',
    shopifyCategory: 'Home & Garden > Household Supplies > Waste Containment > Trash Cans',
    topLevelCategory: 'Home & Garden > Household Supplies',
    googleProductCategory: 'Home & Garden > Household Supplies > Waste Containment > Trash Cans',
    spanishType: 'Cubos de Basura',
  },
  'sofa beds & chaise lounges': {
    englishCategory: 'Sofa Beds & Chaise Lounges',
    shopifyCategory: 'Furniture > Living Room Furniture > Sofas',
    topLevelCategory: 'Furniture > Living Room Furniture',
    googleProductCategory: 'Furniture > Living Room Furniture > Sofas',
    spanishType: 'Sofás y Chaise Longues',
  },
  'storage cabinets': {
    englishCategory: 'Storage Cabinets',
    shopifyCategory: 'Furniture > Cabinets & Storage > Storage Cabinets & Lockers',
    topLevelCategory: 'Furniture > Cabinets & Storage',
    googleProductCategory: 'Furniture > Cabinets & Storage > Storage Cabinets & Lockers',
    spanishType: 'Armarios y Muebles Auxiliares',
  },
  awnings: {
    englishCategory: 'Awnings',
    shopifyCategory: 'Hardware > Building Materials > Canopies & Awnings',
    topLevelCategory: 'Hardware > Building Materials',
    googleProductCategory: 'Hardware > Building Materials > Canopies & Awnings',
    spanishType: 'Toldos y Pérgolas',
  },
  'garden furniture sets': {
    englishCategory: 'Garden Furniture Sets',
    shopifyCategory: 'Furniture > Outdoor Furniture > Outdoor Furniture Sets',
    topLevelCategory: 'Furniture > Outdoor Furniture',
    googleProductCategory: 'Furniture > Outdoor Furniture > Outdoor Furniture Sets',
    spanishType: 'Conjuntos de Muebles de Jardín',
  },
  'sun loungers': {
    englishCategory: 'Sun Loungers',
    shopifyCategory: 'Furniture > Outdoor Furniture > Outdoor Chairs > Sunloungers',
    topLevelCategory: 'Furniture > Outdoor Furniture',
    googleProductCategory: 'Furniture > Outdoor Furniture > Outdoor Chairs > Sunloungers',
    spanishType: 'Tumbonas de Jardín',
  },
  'parasol umbrellas & accessories': {
    englishCategory: 'Parasol Umbrellas & Accessories',
    shopifyCategory: 'Home & Garden > Lawn & Garden > Outdoor Living > Outdoor Umbrellas & Sunshades',
    topLevelCategory: 'Home & Garden > Lawn & Garden',
    googleProductCategory: 'Home & Garden > Lawn & Garden > Outdoor Living > Outdoor Umbrellas & Sunshades',
    spanishType: 'Sombrillas y Parasoles',
  },
  tables: {
    englishCategory: 'Tables',
    shopifyCategory: 'Furniture > Tables > Kitchen & Dining Room Tables',
    topLevelCategory: 'Furniture > Tables',
    googleProductCategory: 'Furniture > Tables > Kitchen & Dining Room Tables',
    spanishType: 'Mesas de Comedor y Centro',
  },
  'shade sails': {
    englishCategory: 'Shade Sails',
    shopifyCategory: 'Home & Garden > Lawn & Garden > Outdoor Living > Outdoor Umbrellas & Sunshades',
    topLevelCategory: 'Home & Garden > Lawn & Garden',
    googleProductCategory: 'Home & Garden > Lawn & Garden > Outdoor Living > Outdoor Umbrellas & Sunshades',
    spanishType: 'Toldos Vela de Sombra',
  },
  'charcoal grills': {
    englishCategory: 'Charcoal Grills',
    shopifyCategory: 'Home & Garden > Lawn & Garden > Outdoor Living > Outdoor Grills',
    topLevelCategory: 'Home & Garden > Lawn & Garden',
    googleProductCategory: 'Home & Garden > Lawn & Garden > Outdoor Living > Outdoor Grills',
    spanishType: 'Barbacoas y Parrillas',
  },
  'bookcases & shelves': {
    englishCategory: 'Bookcases & Shelves',
    shopifyCategory: 'Furniture > Shelving > Bookcases & Standing Shelves',
    topLevelCategory: 'Furniture > Shelving',
    googleProductCategory: 'Furniture > Shelving > Bookcases & Standing Shelves',
    spanishType: 'Estanterías y Librerías',
  },
  'camping & hiking': {
    englishCategory: 'Camping & Hiking',
    shopifyCategory: 'Sporting Goods > Outdoor Recreation > Camping & Hiking',
    topLevelCategory: 'Sporting Goods > Outdoor Recreation',
    googleProductCategory: 'Sporting Goods > Outdoor Recreation > Camping & Hiking',
    spanishType: 'Camping y Aire Libre',
  },
  'pet supplies': {
    englishCategory: 'Pet Supplies',
    shopifyCategory: 'Animals & Pet Supplies > Pet Supplies',
    topLevelCategory: 'Animals & Pet Supplies > Pet Supplies',
    googleProductCategory: 'Animals & Pet Supplies > Pet Supplies',
    spanishType: 'Mascotas',
  },
  'office chairs': {
    englishCategory: 'Office Chairs',
    shopifyCategory: 'Furniture > Office Furniture > Office Chairs',
    topLevelCategory: 'Furniture > Office Furniture',
    googleProductCategory: 'Furniture > Office Furniture > Office Chairs',
    spanishType: 'Sillas de Oficina',
  },
  desks: {
    englishCategory: 'Desks',
    shopifyCategory: 'Furniture > Office Furniture > Desks',
    topLevelCategory: 'Furniture > Office Furniture',
    googleProductCategory: 'Furniture > Office Furniture > Desks',
    spanishType: 'Escritorios de Oficina',
  },
  'shoe racks': {
    englishCategory: 'Shoe Racks',
    shopifyCategory: 'Home & Garden > Household Supplies > Storage & Organization > Clothing & Wardrobe Storage > Shoe Racks & Organizers',
    topLevelCategory: 'Home & Garden > Household Supplies',
    googleProductCategory: 'Home & Garden > Household Supplies > Storage & Organization > Clothing & Wardrobe Storage > Shoe Racks & Organizers',
    spanishType: 'Zapateros',
  },
};

/**
 * Resolves full Shopify Standard Category, 1-2 level taxonomy, and Spanish localized type
 * from raw Aosom 3rd-level English category or title keywords
 */
export function resolveShopifyTaxonomy(rawCategory: string = '', rawTitle: string = ''): TaxonomyMapping {
  const normCat = (rawCategory || '').trim().toLowerCase();
  if (normCat && AOSOM_TAXONOMY_MAP[normCat]) {
    return AOSOM_TAXONOMY_MAP[normCat];
  }

  // Substring search in predefined dictionary
  for (const [key, mapping] of Object.entries(AOSOM_TAXONOMY_MAP)) {
    if (normCat.includes(key) || key.includes(normCat)) {
      return mapping;
    }
  }

  // Keyword-based fallback matching across category & title
  const combined = `${normCat} ${(rawTitle || '').toLowerCase()}`;

  if (/greenhouse|invernadero/i.test(combined)) {
    return AOSOM_TAXONOMY_MAP['greenhouse'];
  }
  if (/nightstand|mesita.*noche/i.test(combined)) {
    return AOSOM_TAXONOMY_MAP['nightstands'];
  }
  if (/trampa|trap|animal.*vivo|camping|hiking|tienda.*campa/i.test(combined)) {
    return AOSOM_TAXONOMY_MAP['camping & hiking'];
  }
  if (/perro|gato|mascota|pet|cat|dog|jaula|rascador|pajarera/i.test(combined)) {
    return AOSOM_TAXONOMY_MAP['pet supplies'];
  }
  if (/oficina|escritorio|silla.*oficina|vinsetto|desk|office.*chair/i.test(combined)) {
    return AOSOM_TAXONOMY_MAP['office chairs'];
  }
  if (/sofa|sofá|chaise|sillón|butaca/i.test(combined)) {
    return AOSOM_TAXONOMY_MAP['sofa beds & chaise lounges'];
  }
  if (/toldo|pérgola|cenador|awning|pergola|gazebo|sombrilla|parasol/i.test(combined)) {
    return AOSOM_TAXONOMY_MAP['awnings'];
  }
  if (/jardín|garden|outdoor|terraza|tumbona|hamaca|grill|barbacoa/i.test(combined)) {
    return AOSOM_TAXONOMY_MAP['other outdoor furniture'];
  }
  if (/armario|estantería|librería|zapatero|storage|cabinet|shelf|shelves/i.test(combined)) {
    return AOSOM_TAXONOMY_MAP['storage cabinets'];
  }
  if (/mesa|table|comedor|dining/i.test(combined)) {
    return AOSOM_TAXONOMY_MAP['tables'];
  }

  // Default fallback ensures category is never left blank in Shopify
  const capEnglish = rawCategory
    ? rawCategory.trim().charAt(0).toUpperCase() + rawCategory.trim().slice(1)
    : 'Home & Living';

  return {
    englishCategory: capEnglish,
    shopifyCategory: 'Home & Garden > Lawn & Garden',
    topLevelCategory: 'Home & Garden > Lawn & Garden',
    googleProductCategory: 'Home & Garden > Lawn & Garden',
    spanishType: rawCategory || 'Hogar y Decoración',
  };
}

export const DEFAULT_PRICING_CONFIG: PricingConfig = {
  tiers: [
    { id: 'tier-1', name: 'Low Cost (< €20)', minCost: 0, maxCost: 20, multiplier: 2.5, flatFee: 0 },
    { id: 'tier-2', name: 'Mid Cost (€20 - €50)', minCost: 20, maxCost: 50, multiplier: 2.0, flatFee: 0 },
    { id: 'tier-3', name: 'High Cost (> €50)', minCost: 50, maxCost: 999999, multiplier: 1.8, flatFee: 0 },
  ],
  rounding: '99',
  enableCompareAtPrice: false, // 默认关闭吊牌划线价，防止被 GMC 判定虚假促销
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

  // Calculate compare-at price (MSRP) ONLY if enabled
  let finalCompareAt = 0;
  if (config.enableCompareAtPrice) {
    let rawCompareAt = finalPrice * (config.compareAtMultiplier || 1.35);
    finalCompareAt = Math.floor(rawCompareAt) + 0.99;
    if (finalCompareAt <= finalPrice) {
      finalCompareAt = finalPrice + 10;
    }
    finalCompareAt = Math.round(finalCompareAt * 100) / 100;
  }

  const profitAmount = Math.round((finalPrice - cost - config.shippingFee) * 100) / 100;
  const profitMargin = finalPrice > 0 ? Math.round((profitAmount / finalPrice) * 1000) / 10 : 0;

  return {
    sellingPrice: Math.round(finalPrice * 100) / 100,
    compareAtPrice: finalCompareAt,
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

  // 1. Resolve Shopify 1st/2nd level taxonomy & English category
  const rawEnglishCat = (item.englishCategory || item.category || '').trim();
  const taxonomy = resolveShopifyTaxonomy(rawEnglishCat, item.originalTitle);

  // 2. Put Aosom 3rd-level English category into tags (Requirement 1)
  const tagSet = new Set<string>();
  (whitewashConfig.autoTags || []).forEach((t) => t && tagSet.add(t));
  if (taxonomy.englishCategory) {
    tagSet.add(taxonomy.englishCategory); // English 3rd-level category name in tag
  }
  if (taxonomy.spanishType && taxonomy.spanishType !== taxonomy.englishCategory) {
    tagSet.add(taxonomy.spanishType);
  }
  if (item.mainColor) {
    tagSet.add(item.mainColor);
  }

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
    compareAtPrice: pricing.compareAtPrice, // 0 when disabled (GMC safety)
    profitMargin: pricing.profitMargin,
    profitAmount: pricing.profitAmount,
    stock: rawStock,
    availableStock,
    images: item.images && item.images.length > 0 ? item.images : [
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80',
    ],
    category: taxonomy.spanishType || item.category || whitewashConfig.defaultCategory,
    englishCategory: taxonomy.englishCategory,
    shopifyCategory: taxonomy.shopifyCategory, // 1-2级标准目录，Shopify后台不留空
    googleProductCategory: taxonomy.googleProductCategory,
    mainColor: item.mainColor,
    dimensions: item.dimensions,
    tags: Array.from(tagSet),
    descriptionHtml: cleanDescHtml,
    status: availableStock > 0 ? 'active' : 'draft',
    syncStatus: 'idle',
  };
}

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
