import React from 'react';
import { Package, TrendingUp, ShieldAlert, CheckCircle2, DollarSign, Layers } from 'lucide-react';
import { CleansedProduct, PricingConfig, WhitewashConfig } from '../types';

interface DashboardStatsProps {
  products: CleansedProduct[];
  pricingConfig: PricingConfig;
  whitewashConfig: WhitewashConfig;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({
  products,
  pricingConfig,
  whitewashConfig,
}) => {
  const totalCount = products.length;
  const inStockCount = products.filter((p) => p.availableStock > 0).length;
  const lowStockCount = products.filter((p) => p.stock > 0 && p.availableStock === 0).length;
  const syncedCount = products.filter((p) => p.syncStatus === 'success').length;

  const totalCost = products.reduce((sum, p) => sum + p.costPrice * p.availableStock, 0);
  const totalRevenue = products.reduce((sum, p) => sum + p.price * p.availableStock, 0);
  const avgMargin =
    products.length > 0
      ? (products.reduce((sum, p) => sum + p.profitMargin, 0) / products.length).toFixed(1)
      : '0.0';

  const avgPrice =
    products.length > 0
      ? (products.reduce((sum, p) => sum + p.price, 0) / products.length).toFixed(2)
      : '0.00';

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5 mb-6">
      {/* 1. Total Products */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 shadow-sm">
        <div className="flex items-center justify-between text-slate-400 mb-1.5">
          <span className="text-xs font-medium">总商品数</span>
          <Package className="w-4 h-4 text-indigo-400" />
        </div>
        <div className="text-2xl font-bold text-white tracking-tight">{totalCount}</div>
        <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
          <span className="text-emerald-400 font-medium">100%</span> 已自动洗白编码
        </div>
      </div>

      {/* 2. In Stock */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 shadow-sm">
        <div className="flex items-center justify-between text-slate-400 mb-1.5">
          <span className="text-xs font-medium">可售现货</span>
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="text-2xl font-bold text-emerald-400 tracking-tight">{inStockCount}</div>
        <div className="text-[11px] text-slate-400 mt-0.5">
          安全缓冲量: -{whitewashConfig.safetyStockBuffer} 件/款
        </div>
      </div>

      {/* 3. Low/Zero Stock Alert */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 shadow-sm">
        <div className="flex items-center justify-between text-slate-400 mb-1.5">
          <span className="text-xs font-medium">库存熔断保护</span>
          <ShieldAlert className="w-4 h-4 text-amber-400" />
        </div>
        <div className="text-2xl font-bold text-amber-400 tracking-tight">{lowStockCount}</div>
        <div className="text-[11px] text-slate-400 mt-0.5">
          低余量自动下架/置0
        </div>
      </div>

      {/* 4. Avg Margin */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 shadow-sm">
        <div className="flex items-center justify-between text-slate-400 mb-1.5">
          <span className="text-xs font-medium">平均毛利率</span>
          <TrendingUp className="w-4 h-4 text-sky-400" />
        </div>
        <div className="text-2xl font-bold text-sky-400 tracking-tight">{avgMargin}%</div>
        <div className="text-[11px] text-slate-400 mt-0.5">
          按 {pricingConfig.tiers.length} 阶梯加价核算
        </div>
      </div>

      {/* 5. Avg Retail Price */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 shadow-sm">
        <div className="flex items-center justify-between text-slate-400 mb-1.5">
          <span className="text-xs font-medium">均件零售价</span>
          <DollarSign className="w-4 h-4 text-indigo-400" />
        </div>
        <div className="text-2xl font-bold text-white tracking-tight">€{avgPrice}</div>
        <div className="text-[11px] text-slate-400 mt-0.5">
          尾数: .{pricingConfig.rounding} 规整
        </div>
      </div>

      {/* 6. Synced to Shopify */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 shadow-sm">
        <div className="flex items-center justify-between text-slate-400 mb-1.5">
          <span className="text-xs font-medium">Shopify 已同步</span>
          <Layers className="w-4 h-4 text-purple-400" />
        </div>
        <div className="text-2xl font-bold text-purple-400 tracking-tight">
          {syncedCount} <span className="text-xs text-slate-500 font-normal">/ {totalCount}</span>
        </div>
        <div className="text-[11px] text-slate-400 mt-0.5">
          {syncedCount === totalCount && totalCount > 0 ? '全部就绪' : '等待一键上架'}
        </div>
      </div>
    </div>
  );
};
