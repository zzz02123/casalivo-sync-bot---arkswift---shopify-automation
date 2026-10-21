import React, { useState } from 'react';
import { UploadCloud, FileSpreadsheet, Check, AlertCircle, X, ArrowRight } from 'lucide-react';
import Papa from 'papaparse';
import { ArkSwiftRawItem } from '../types';

interface CsvUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportProducts: (items: ArkSwiftRawItem[]) => void;
}

export const CsvUploadModal: React.FC<CsvUploadModalProps> = ({
  isOpen,
  onClose,
  onImportProducts,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [columnMapping, setColumnMapping] = useState<{
    sku: string;
    title: string;
    price: string;
    stock: string;
    vendor: string;
    images: string;
    category: string;
  }>({
    sku: '',
    title: '',
    price: '',
    stock: '',
    vendor: '',
    images: '',
    category: '',
  });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setErrorMsg(null);

    Papa.parse(selectedFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0 && results.data.length === 0) {
          setErrorMsg('CSV 解析错误: ' + results.errors[0].message);
          return;
        }

        const data = results.data as Record<string, any>[];
        setParsedRows(data);
        const detectedHeaders = results.meta.fields || [];
        setHeaders(detectedHeaders);

        // Auto match columns based on typical ArkSwift / inventory headers
        const mapping = {
          sku: detectedHeaders.find((h) => /sku|商品编码|条形码|code|item_no/i.test(h)) || detectedHeaders[0] || '',
          title: detectedHeaders.find((h) => /title|name|商品名称|标题|item_name/i.test(h)) || detectedHeaders[1] || '',
          price: detectedHeaders.find((h) => /price|cost|成本|供货价|单价|批发价/i.test(h)) || '',
          stock: detectedHeaders.find((h) => /stock|quantity|qty|库存|数量|可用库存/i.test(h)) || '',
          vendor: detectedHeaders.find((h) => /vendor|supplier|品牌|供应商|原厂/i.test(h)) || '',
          images: detectedHeaders.find((h) => /image|img|图片|主图|pic/i.test(h)) || '',
          category: detectedHeaders.find((h) => /category|cat|分类|类目/i.test(h)) || '',
        };
        setColumnMapping(mapping);
      },
    });
  };

  const handleConfirmImport = () => {
    if (parsedRows.length === 0) {
      setErrorMsg('没有可导入的数据行');
      return;
    }

    const items: ArkSwiftRawItem[] = parsedRows.map((row, idx) => {
      const rawSku = String(row[columnMapping.sku] || `ITEM-${idx + 1}`).trim();
      const rawTitle = String(row[columnMapping.title] || `ArkSwift Item ${rawSku}`).trim();
      const rawPrice = parseFloat(String(row[columnMapping.price] || '0').replace(/[^0-9.]/g, '')) || 25.0;
      const rawStock = parseInt(String(row[columnMapping.stock] || '0').replace(/[^0-9]/g, '')) || 10;
      const rawVendor = String(row[columnMapping.vendor] || 'SPANISH AOSOM SL').trim();
      const rawCategory = String(row[columnMapping.category] || 'Muebles y Hogar').trim();
      const rawImage = String(row[columnMapping.images] || '').trim();

      const images = rawImage
        ? rawImage.split(/[,;|]/).map((u) => u.trim()).filter(Boolean)
        : ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80'];

      return {
        id: `csv-${Date.now()}-${idx}`,
        originalSku: rawSku,
        originalTitle: rawTitle,
        originalVendor: rawVendor,
        originalPrice: rawPrice,
        stock: rawStock,
        category: rawCategory,
        images,
        description: `Imported from ArkSwift CSV export (${rawSku})`,
      };
    });

    onImportProducts(items);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl my-6">
        {/* Header */}
        <div className="bg-slate-800/80 px-6 py-4 border-b border-slate-700/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-sky-500/10 text-sky-400 rounded-lg">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">导入 ArkSwift 库存导出表格</h3>
              <p className="text-xs text-slate-400">支持 CSV / TXT 格式，自动识别列头并映射至 Casalivo 引擎</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* File input */}
          <div className="border-2 border-dashed border-slate-700 hover:border-amber-400/60 rounded-xl p-6 text-center transition bg-slate-950/40">
            <UploadCloud className="w-10 h-10 text-slate-400 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-200 mb-1">
              {file ? file.name : '点击选择或拖拽 ArkSwift 导出文件 (例如: 库存 - 工作表1.csv)'}
            </p>
            <p className="text-[11px] text-slate-500 mb-3">支持从 ArkSwift 分销后台导出的任意商品库存表格</p>
            <label className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg cursor-pointer transition">
              <span>浏览本地文件</span>
              <input type="file" accept=".csv,.txt" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-950/60 border border-rose-800 text-rose-300 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Column Mapping Section if file loaded */}
          {headers.length > 0 && (
            <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-200">
                  表格列头映射 (已成功解析 {parsedRows.length} 行数据)
                </span>
                <span className="text-[10px] text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-800">
                  自动配对完成
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1">SKU 编码列 *</label>
                  <select
                    value={columnMapping.sku}
                    onChange={(e) => setColumnMapping({ ...columnMapping, sku: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                  >
                    {headers.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">商品标题列 *</label>
                  <select
                    value={columnMapping.title}
                    onChange={(e) => setColumnMapping({ ...columnMapping, title: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                  >
                    {headers.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">供货底价 / 成本 (€) *</label>
                  <select
                    value={columnMapping.price}
                    onChange={(e) => setColumnMapping({ ...columnMapping, price: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                  >
                    <option value="">-- 未指定 (默认 €25.00) --</option>
                    {headers.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">实时库存量 (Stock) *</label>
                  <select
                    value={columnMapping.stock}
                    onChange={(e) => setColumnMapping({ ...columnMapping, stock: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                  >
                    <option value="">-- 未指定 (默认 10件) --</option>
                    {headers.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-800/80 px-6 py-4 border-t border-slate-700/80 flex items-center justify-between">
          <button onClick={onClose} className="px-4 py-2 bg-slate-800 text-slate-300 text-xs rounded-lg">
            取消
          </button>
          <button
            onClick={handleConfirmImport}
            disabled={parsedRows.length === 0}
            className="flex items-center gap-1.5 px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition disabled:opacity-50"
          >
            <span>开始一键洗白入库 ({parsedRows.length} 行)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
