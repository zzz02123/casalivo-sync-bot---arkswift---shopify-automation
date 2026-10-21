import React, { useState } from 'react';
import { Search, Filter, ShoppingBag, Eye, Code, RefreshCw, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck, FileSpreadsheet } from 'lucide-react';
import { CleansedProduct } from '../types';

interface ProductCatalogTableProps {
  products: CleansedProduct[];
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onSelectAll: (select: boolean) => void;
  onPushSingle: (product: CleansedProduct) => Promise<void>;
  onPreviewProduct: (product: CleansedProduct) => void;
  onInspectPayload: (product: CleansedProduct) => void;
  onExportCsv?: (productsToExport: CleansedProduct[]) => void;
  isPushing: boolean;
}

export const ProductCatalogTable: React.FC<ProductCatalogTableProps> = ({
  products,
  selectedIds,
  onToggleSelect,
  onSelectAll,
  onPushSingle,
  onPreviewProduct,
  onInspectPayload,
  onExportCsv,
  isPushing,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [stockFilter, setStockFilter] = useState<'all' | 'in_stock' | 'low_stock' | 'out_of_stock'>('all');
  const [syncFilter, setSyncFilter] = useState<'all' | 'synced' | 'unsynced'>('all');

  const filteredProducts = products.filter((p) => {
    // Search
    const q = searchQuery.toLowerCase();
    const matchSearch =
      !q ||
      p.sku.toLowerCase().includes(q) ||
      p.originalSku.toLowerCase().includes(q) ||
      p.title.toLowerCase().includes(q) ||
      p.originalTitle.toLowerCase().includes(q);

    // Stock
    let matchStock = true;
    if (stockFilter === 'in_stock') matchStock = p.availableStock > 0;
    else if (stockFilter === 'low_stock') matchStock = p.stock > 0 && p.availableStock === 0;
    else if (stockFilter === 'out_of_stock') matchStock = p.stock === 0;

    // Sync
    let matchSync = true;
    if (syncFilter === 'synced') matchSync = p.syncStatus === 'success';
    else if (syncFilter === 'unsynced') matchSync = p.syncStatus !== 'success';

    return matchSearch && matchStock && matchSync;
  });

  const allSelected = filteredProducts.length > 0 && filteredProducts.every((p) => selectedIds.includes(p.id));

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
      {/* Table Header & Controls */}
      <div className="p-4 sm:p-5 border-b border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-72">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索 SKU、标题或品类..."
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value as any)}
              className="bg-slate-950 border border-slate-700/80 rounded-xl px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-amber-400"
            >
              <option value="all">全部库存状态</option>
              <option value="in_stock">现货充足 (可售)</option>
              <option value="low_stock">安全保护 (熔断)</option>
              <option value="out_of_stock">原仓缺货 (0件)</option>
            </select>

            <select
              value={syncFilter}
              onChange={(e) => setSyncFilter(e.target.value as any)}
              className="bg-slate-950 border border-slate-700/80 rounded-xl px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-amber-400"
            >
              <option value="all">全部同步状态</option>
              <option value="synced">已上架 / 已同步</option>
              <option value="unsynced">未上架 / 待更新</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end md:self-auto text-xs text-slate-400">
          <span>
            共 <strong className="text-white font-mono">{filteredProducts.length}</strong> 件商品
          </span>
          {selectedIds.length > 0 && (
            <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded border border-amber-500/30">
              已选 {selectedIds.length} 件
            </span>
          )}
          {onExportCsv && (
            <button
              onClick={() => {
                const toExport = selectedIds.length > 0 
                  ? filteredProducts.filter((p) => selectedIds.includes(p.id)) 
                  : filteredProducts;
                onExportCsv(toExport);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl shadow-sm transition active:scale-95 ml-1"
              title="导出清洗后的商品为 Shopify 官方导入 CSV 表格"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>导出 Shopify 表格</span>
            </button>
          )}
        </div>
      </div>

      {/* Product List Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
            <tr>
              <th className="py-3 px-4 w-10 text-center">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={(e) => onSelectAll(e.target.checked)}
                  className="rounded border-slate-700 text-amber-500 focus:ring-0 cursor-pointer"
                />
              </th>
              <th className="py-3 px-3 w-16">主图</th>
              <th className="py-3 px-3 w-36">SKU (原 ➔ Casalivo)</th>
              <th className="py-3 px-3 min-w-[280px]">商品名称 (清洗前 ➔ 洗白后)</th>
              <th className="py-3 px-3 w-28">品牌 / 供应商</th>
              <th className="py-3 px-3 w-36">进价 ➔ 售价 &amp; 毛利</th>
              <th className="py-3 px-3 w-24">原仓 ➔ 可售</th>
              <th className="py-3 px-3 w-24 text-center">Shopify 状态</th>
              <th className="py-3 px-4 w-32 text-right">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80 text-slate-300">
            {filteredProducts.map((p) => {
              const isSelected = selectedIds.includes(p.id);

              return (
                <tr
                  key={p.id}
                  className={`hover:bg-slate-800/40 transition group ${
                    isSelected ? 'bg-amber-500/5' : ''
                  }`}
                >
                  {/* Checkbox */}
                  <td className="py-3 px-4 text-center">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleSelect(p.id)}
                      className="rounded border-slate-700 text-amber-500 focus:ring-0 cursor-pointer"
                    />
                  </td>

                  {/* Thumbnail */}
                  <td className="py-3 px-3">
                    <div className="w-12 h-12 rounded-lg overflow-hidden border border-slate-700/80 bg-slate-950 relative shrink-0">
                      <img
                        src={p.images[0]}
                        alt={p.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        loading="lazy"
                      />
                    </div>
                  </td>

                  {/* SKU Comparison */}
                  <td className="py-3 px-3">
                    <div className="font-mono text-amber-300 font-bold tracking-tight">
                      {p.sku}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono line-through flex items-center gap-1">
                      <span>原:</span> {p.originalSku}
                    </div>
                  </td>

                  {/* Title Comparison */}
                  <td className="py-3 px-3">
                    <div className="font-semibold text-white line-clamp-1 group-hover:text-amber-200 transition">
                      {p.title}
                    </div>
                    <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                      原标题: {p.originalTitle}
                    </div>
                  </td>

                  {/* Vendor */}
                  <td className="py-3 px-3">
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-semibold text-[11px]">
                      <ShieldCheck className="w-3 h-3 text-indigo-400" />
                      {p.vendor}
                    </div>
                    <div className="text-[10px] text-slate-500 line-through mt-0.5 truncate max-w-[110px]">
                      {p.originalVendor}
                    </div>
                  </td>

                  {/* Pricing & Margin */}
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-1 font-mono">
                      <span className="text-slate-500 text-[10px]">€{p.costPrice.toFixed(2)}</span>
                      <ArrowRight className="w-3 h-3 text-slate-600" />
                      <span className="font-bold text-amber-400 text-sm">€{p.price.toFixed(2)}</span>
                    </div>
                    <div className="text-[10px] text-emerald-400 font-medium">
                      毛利: €{p.profitAmount.toFixed(2)} ({p.profitMargin}%)
                    </div>
                  </td>

                  {/* Stock */}
                  <td className="py-3 px-3">
                    <div className="font-mono font-bold text-white">
                      {p.availableStock} <span className="text-[10px] text-slate-400 font-normal">件</span>
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      原仓: {p.stock} 件
                    </div>
                  </td>

                  {/* Shopify Status */}
                  <td className="py-3 px-3 text-center">
                    {p.syncStatus === 'success' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px]">
                        <CheckCircle2 className="w-3 h-3" /> 已上架
                      </span>
                    ) : p.syncStatus === 'pending' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px]">
                        <RefreshCw className="w-3 h-3 animate-spin" /> 推送中
                      </span>
                    ) : p.syncStatus === 'failed' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[11px]">
                        <AlertCircle className="w-3 h-3" /> 失败
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 text-[11px]">
                        草稿待推
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onPreviewProduct(p)}
                        className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition"
                        title="查看独立站详情页模拟"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => onInspectPayload(p)}
                        className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-amber-400 rounded-lg transition"
                        title="查看 Shopify API 原始 Payload"
                      >
                        <Code className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => onPushSingle(p)}
                        disabled={isPushing}
                        className="px-2 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-semibold transition active:scale-95 disabled:opacity-50"
                        title="立即推送此单件到 Shopify"
                      >
                        推送
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {filteredProducts.length === 0 && (
              <tr>
                <td colSpan={9} className="py-12 text-center text-slate-500">
                  <div className="max-w-xs mx-auto space-y-2">
                    <p className="text-sm">未找到符合条件的商品</p>
                    <p className="text-xs text-slate-600">
                      请尝试重置搜索关键词，或点击右上角「导入表格」添加新数据
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
