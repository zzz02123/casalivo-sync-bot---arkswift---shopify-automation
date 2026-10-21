import Papa from 'papaparse';
import { CleansedProduct, ArkSwiftRawItem } from '../types';

/**
 * Standard Shopify Product CSV Header specification
 */
export interface ShopifyCsvRow {
  Handle: string;
  Title: string;
  'Body (HTML)': string;
  Vendor: string;
  'Product Category': string;
  Type: string;
  Tags: string;
  Published: string;
  'Option1 Name': string;
  'Option1 Value': string;
  'Option2 Name'?: string;
  'Option2 Value'?: string;
  'Option3 Name'?: string;
  'Option3 Value'?: string;
  'Variant SKU': string;
  'Variant Grams': string;
  'Variant Inventory Tracker': string;
  'Variant Inventory Qty': string;
  'Variant Inventory Policy': string;
  'Variant Fulfillment Service': string;
  'Variant Price': string;
  'Variant Compare At Price': string;
  'Variant Requires Shipping': string;
  'Variant Taxable': string;
  'Variant Barcode': string;
  'Image Src': string;
  'Image Position': string;
  'Image Alt Text': string;
  'Gift Card': string;
  'SEO Title': string;
  'SEO Description': string;
  'Google Shopping / Google Product Category': string;
  'Google Shopping / Gender': string;
  'Google Shopping / Age Group': string;
  'Google Shopping / MPN': string;
  'Google Shopping / Condition': string;
  'Google Shopping / Custom Product': string;
  'Google Shopping / Custom Label 0': string;
  'Variant Image': string;
  'Variant Weight Unit': string;
  'Cost per item': string;
  Status: string;
}

/**
 * Generate a URL-friendly handle slug from title and SKU
 */
export function generateHandle(title: string, sku: string): string {
  const cleanTitle = title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove accents (á -> a)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50);

  const cleanSku = sku.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  return `${cleanSku}-${cleanTitle}`.replace(/-+/g, '-').replace(/^-+|-+$/g, '');
}

/**
 * Converts CleansedProduct items into Shopify's standard CSV export format
 * Properly handles multi-image support (one row per additional image)
 */
export function convertToShopifyCsvRows(
  products: CleansedProduct[],
  rawItemsMap: Map<string, ArkSwiftRawItem> = new Map()
): ShopifyCsvRow[] {
  const rows: ShopifyCsvRow[] = [];

  for (const product of products) {
    const raw = rawItemsMap.get(product.originalSku) || rawItemsMap.get(product.sku);
    const handle = generateHandle(product.title, product.sku);
    const weightKg = raw?.weight || 1.0;
    const grams = Math.round(weightKg * 1000).toString();
    const barcode = raw?.barcode || '';
    const images = product.images && product.images.length > 0 ? product.images : [];

    // Main variant row (first row contains full product info)
    const mainRow: ShopifyCsvRow = {
      Handle: handle,
      Title: product.title,
      'Body (HTML)': product.descriptionHtml || `<p>${product.title}</p>`,
      Vendor: product.vendor || 'Casalivo',
      'Product Category': '',
      Type: product.category || 'Home & Living',
      Tags: (product.tags || ['Casalivo', 'Dropship', 'VerifiedStock']).join(', '),
      Published: 'TRUE',
      'Option1 Name': 'Title',
      'Option1 Value': 'Default Title',
      'Option2 Name': '',
      'Option2 Value': '',
      'Option3 Name': '',
      'Option3 Value': '',
      'Variant SKU': product.sku,
      'Variant Grams': grams,
      'Variant Inventory Tracker': 'shopify',
      'Variant Inventory Qty': product.availableStock.toString(),
      'Variant Inventory Policy': 'deny',
      'Variant Fulfillment Service': 'manual',
      'Variant Price': product.price.toFixed(2),
      'Variant Compare At Price': product.compareAtPrice ? product.compareAtPrice.toFixed(2) : '',
      'Variant Requires Shipping': 'TRUE',
      'Variant Taxable': 'FALSE',
      'Variant Barcode': barcode,
      'Image Src': images[0] || '',
      'Image Position': images[0] ? '1' : '',
      'Image Alt Text': product.title,
      'Gift Card': 'FALSE',
      'SEO Title': product.title.slice(0, 70),
      'SEO Description': (product.title + ' - Colección exclusiva Casalivo. Envío rápido y garantía de calidad.').slice(0, 160),
      'Google Shopping / Google Product Category': '',
      'Google Shopping / Gender': '',
      'Google Shopping / Age Group': '',
      'Google Shopping / MPN': product.sku,
      'Google Shopping / Condition': 'new',
      'Google Shopping / Custom Product': 'FALSE',
      'Google Shopping / Custom Label 0': 'Casalivo',
      'Variant Image': images[0] || '',
      'Variant Weight Unit': 'kg',
      'Cost per item': product.costPrice ? product.costPrice.toFixed(2) : '',
      Status: product.status || 'active',
    };

    rows.push(mainRow);

    // If product has more images, append additional image rows for Shopify
    if (images.length > 1) {
      for (let i = 1; i < images.length; i++) {
        rows.push({
          Handle: handle,
          Title: '',
          'Body (HTML)': '',
          Vendor: '',
          'Product Category': '',
          Type: '',
          Tags: '',
          Published: '',
          'Option1 Name': '',
          'Option1 Value': '',
          'Variant SKU': '',
          'Variant Grams': '',
          'Variant Inventory Tracker': '',
          'Variant Inventory Qty': '',
          'Variant Inventory Policy': '',
          'Variant Fulfillment Service': '',
          'Variant Price': '',
          'Variant Compare At Price': '',
          'Variant Requires Shipping': '',
          'Variant Taxable': '',
          'Variant Barcode': '',
          'Image Src': images[i],
          'Image Position': (i + 1).toString(),
          'Image Alt Text': `${product.title} - Vista ${i + 1}`,
          'Gift Card': '',
          'SEO Title': '',
          'SEO Description': '',
          'Google Shopping / Google Product Category': '',
          'Google Shopping / Gender': '',
          'Google Shopping / Age Group': '',
          'Google Shopping / MPN': '',
          'Google Shopping / Condition': '',
          'Google Shopping / Custom Product': '',
          'Google Shopping / Custom Label 0': '',
          'Variant Image': '',
          'Variant Weight Unit': '',
          'Cost per item': '',
          Status: '',
        });
      }
    }
  }

  return rows;
}

/**
 * Generates ready-to-download Shopify CSV string
 */
export function generateShopifyCsv(
  products: CleansedProduct[],
  rawItemsMap: Map<string, ArkSwiftRawItem> = new Map()
): string {
  const rows = convertToShopifyCsvRows(products, rawItemsMap);
  return Papa.unparse(rows, {
    quotes: true,
    header: true,
    newline: '\r\n', // Standard Windows/Excel/Shopify CRLF line ending
  });
}

/**
 * Triggers a browser download of the generated Shopify CSV file
 */
export function downloadShopifyCsv(
  products: CleansedProduct[],
  rawItemsMap: Map<string, ArkSwiftRawItem> = new Map(),
  filename: string = 'shopify_products_export.csv'
) {
  const csvContent = generateShopifyCsv(products, rawItemsMap);
  // Add UTF-8 BOM so Excel opens Spanish accents (ñ, á, é) properly
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
