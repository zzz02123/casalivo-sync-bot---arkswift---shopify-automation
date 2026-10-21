import React from 'react';
import { X, Check, ShieldCheck, Truck, RotateCcw, Star, ShoppingCart } from 'lucide-react';
import { CleansedProduct } from '../types';

interface ProductPreviewModalProps {
  product: CleansedProduct | null;
  onClose: () => void;
}

export const ProductPreviewModal: React.FC<ProductPreviewModalProps> = ({ product, onClose }) => {
  if (!product) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white text-slate-900 rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl my-6">
        {/* Mock Storefront Header */}
        <div className="bg-slate-900 text-white px-6 py-3 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-amber-400 tracking-tight text-sm">CASALIVO</span>
            <span className="text-slate-500 text-xs">| 独立站商品详情页实时渲染模拟</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Storefront Layout */}
        <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Gallery */}
          <div className="space-y-3">
            <div className="aspect-square rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shadow-inner">
              <img
                src={product.images[0]}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-2">
                {product.images.slice(0, 4).map((img, i) => (
                  <div key={i} className="w-16 h-16 rounded-lg overflow-hidden border border-slate-200">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-4">
            <div>
              <div className="text-xs uppercase tracking-wider text-indigo-600 font-semibold mb-1">
                {product.vendor} • {product.category}
              </div>
              <h2 className="text-xl font-bold text-slate-900 leading-snug">{product.title}</h2>
              <div className="text-xs text-slate-500 font-mono mt-1 flex items-center gap-2">
                <span>SKU: {product.sku}</span>
                <span>•</span>
                <span className="text-emerald-600 font-medium flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> 现货充足 ({product.availableStock} 件)
                </span>
              </div>
            </div>

            {/* Price Box */}
            <div className="flex items-baseline space-x-3 p-3 bg-amber-50/70 rounded-xl border border-amber-200/80">
              <span className="text-3xl font-extrabold text-slate-900">€{product.price.toFixed(2)}</span>
              {product.compareAtPrice > product.price && (
                <span className="text-base text-slate-400 line-through">
                  €{product.compareAtPrice.toFixed(2)}
                </span>
              )}
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-600 text-white">
                包邮含税
              </span>
            </div>

            {/* CTA Button */}
            <button className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-md transition">
              <ShoppingCart className="w-4 h-4" />
              <span>加入购物车 (Add to Cart)</span>
            </button>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-200 text-center text-[11px] text-slate-600">
              <div className="flex flex-col items-center gap-1">
                <Truck className="w-4 h-4 text-slate-700" />
                <span>欧洲本地极速派送</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <RotateCcw className="w-4 h-4 text-slate-700" />
                <span>30天无忧退换</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                <span>Casalivo 正品保真</span>
              </div>
            </div>

            {/* Description Preview */}
            <div className="text-xs text-slate-600 leading-relaxed max-h-36 overflow-y-auto pr-1">
              <div
                dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
