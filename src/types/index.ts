export interface ArkSwiftRawItem {
  id: string;
  originalSku: string;
  originalTitle: string;
  originalVendor: string;
  originalPrice: number; // Cost / supply price in EUR
  stock: number;
  category: string;
  barcode?: string;
  images: string[];
  description?: string;
  weight?: number; // in kg
  dimensions?: string;
  selected?: boolean;
}

export interface CleansedProduct {
  id: string;
  sku: string; // e.g. CSL-01-0340
  originalSku: string;
  title: string;
  originalTitle: string;
  vendor: string; // 'Casalivo'
  originalVendor: string;
  costPrice: number;
  price: number; // Selling price in EUR
  compareAtPrice: number; // Strikethrough MSRP
  profitMargin: number; // Percentage, e.g. 52.3%
  profitAmount: number; // in EUR
  stock: number;
  availableStock: number; // after safety buffer
  images: string[];
  category: string;
  tags: string[];
  descriptionHtml: string;
  status: 'active' | 'draft';
  syncStatus: 'idle' | 'pending' | 'success' | 'failed';
  lastSyncAt?: string;
  shopifyId?: string;
  errorMessage?: string;
}

export interface PricingTier {
  id: string;
  name: string;
  minCost: number;
  maxCost: number;
  multiplier: number; // e.g. 2.5
  flatFee: number; // e.g. 0
}

export interface PricingConfig {
  tiers: PricingTier[];
  rounding: '99' | '95' | 'integer' | 'none';
  compareAtMultiplier: number; // e.g. 1.35x
  shippingFee: number;
  taxRatePercent: number; // e.g. 0 or 21%
}

export interface WordReplacement {
  id: string;
  from: string;
  to: string;
  isRegex?: boolean;
}

export interface WhitewashConfig {
  brandName: string; // 'Casalivo'
  skuPrefix: string; // 'CSL-'
  vendorBlacklist: string[]; // e.g. ['SPANISH AOSOM SL', 'Aosom', 'Homcom', 'Outsunny']
  wordReplacements: WordReplacement[];
  bannedKeywords: string[]; // e.g. ['warranty', 'official dealer', 'Aosom.es']
  safetyStockBuffer: number; // e.g. 3 (if stock < 3, mark as 0)
  autoTags: string[]; // ['Casalivo', 'Dropship', 'Fast Delivery']
  defaultCategory: string;
}

export interface ShopifyConfig {
  shopDomain: string; // e.g. td5kxa-2d.myshopify.com
  /** @deprecated token 只存在于服务端内存 (Client Credentials Grant)，前端永不保存 */
  accessToken?: string;
  apiVersion: string;
  locationId: string;
  locationName: string;
  isConnected: boolean;
}

export interface ArkSwiftConfig {
  apiUrl: string;
  appKey: string;
  appSecret: string;
  sellerId: string;
  algorithm: 'md5' | 'sha256' | 'rsa-sha256';
  signStyle: 'secret_suffix' | 'secret_sandwich';
  isConnected: boolean;
}

export interface SyncLogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'success' | 'warn' | 'error';
  category: 'arkswift' | 'whitewash' | 'shopify' | 'system';
  message: string;
  details?: any;
}
