import { PricingConfig, WhitewashConfig } from '../types';

export function generatePythonSyncBotCode(
  whitewashConfig: WhitewashConfig,
  pricingConfig: PricingConfig,
  shopifyConfig: { shopDomain: string; apiVersion: string; accessToken?: string; locationId?: string },
  arkswiftConfig: { apiUrl: string; algorithm: string; appKey?: string; appSecret?: string }
): {
  'sync_bot.py': string;
  'arkswift_api.py': string;
  'whitewash_engine.py': string;
  'shopify_client.py': string;
  'run_daily_sync.bat': string;
  'requirements.txt': string;
  '.env.example': string;
} {
  const replacementsDict = whitewashConfig.wordReplacements
    .map((r) => `        "${r.from}": "${r.to}",`)
    .join('\n');

  const bannedList = whitewashConfig.bannedKeywords
    .map((k) => `        "${k}",`)
    .join('\n');

  const tiersJson = JSON.stringify(pricingConfig.tiers, null, 4);

  const arkswiftApiPy = `"""
ArkSwift API Client & Signature Generator
Handles parameter ASCII sorting, MD5/SHA256 signature, and data extraction.
"""
import time
import hashlib
import hmac
import requests
from typing import Dict, Any, List, Optional

class ArkSwiftClient:
    def __init__(self, api_url: str, app_key: str, app_secret: str, algorithm: str = "${arkswiftConfig.algorithm || 'md5'}"):
        self.api_url = api_url.rstrip("/")
        self.app_key = app_key
        self.app_secret = app_secret
        self.algorithm = algorithm.lower()

    def generate_signature(self, params: Dict[str, Any]) -> str:
        """
        1. 过滤空值和已存在的 sign 参数
        2. 按参数名 ASCII 升序字典排序
        3. 拼接 key=value 并追加 app_secret
        4. 计算 MD5 或 HMAC 哈希并转大写
        """
        filtered_items = [
            (k, v) for k, v in params.items() 
            if k != "sign" and v is not None and str(v).strip() != ""
        ]
        sorted_items = sorted(filtered_items, key=lambda x: x[0])
        query_string = "&".join(f"{k}={v}" for k, v in sorted_items)
        
        # 拼接签名原串 (默认: 参数串 + &secret=密钥)
        sign_string = f"{query_string}&secret={self.app_secret}"

        if self.algorithm == "sha256":
            signature = hmac.new(
                self.app_secret.encode("utf-8"),
                sign_string.encode("utf-8"),
                hashlib.sha256
            ).hexdigest().upper()
        else:
            signature = hashlib.md5(sign_string.encode("utf-8")).hexdigest().upper()

        return signature

    def request(self, endpoint: str, extra_params: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        向 ArkSwift 发送带有签名的 GET/POST 请求
        """
        params = {
            "app_key": self.app_key,
            "timestamp": int(time.time()),
            "format": "json",
            "v": "1.0",
        }
        if extra_params:
            params.update(extra_params)

        params["sign"] = self.generate_signature(params)

        url = f"{self.api_url}/{endpoint.lstrip('/')}"
        headers = {"Content-Type": "application/json"}
        
        response = requests.get(url, params=params, headers=headers, timeout=30)
        response.raise_for_status()
        return response.json()

    def fetch_product_inventory(self, page: int = 1, page_size: int = 50) -> List[Dict[str, Any]]:
        """
        拉取商品库存与价格列表
        """
        res = self.request("api/open/products/stock", {"page": page, "page_size": page_size})
        # 根据实际接口响应格式提取
        if isinstance(res, dict) and "data" in res:
            return res["data"].get("list", [])
        return []
`;

  const whitewashEnginePy = `"""
Casalivo Data Cleansing & Pricing Engine (洗白与加价模块)
- 品牌替换为 Casalivo
- 敏感词与原供应商黑名单过滤
- 阶梯定价规则计算与利润率核算
- SKU 编码规范化 (CSL- 前缀)
"""
import re
import math
from typing import Dict, Any, List

class WhitewashEngine:
    BRAND_NAME = "${whitewashConfig.brandName}"
    SKU_PREFIX = "${whitewashConfig.skuPrefix}"
    SAFETY_BUFFER = ${whitewashConfig.safetyStockBuffer}
    ROUNDING = "${pricingConfig.rounding}"
    COMPARE_AT_MULTIPLIER = ${pricingConfig.compareAtMultiplier}

    REPLACEMENTS = {
${replacementsDict}
    }

    BANNED_KEYWORDS = [
${bannedList}
    ]

    PRICING_TIERS = ${tiersJson}

    @classmethod
    def calculate_price(cls, cost: float) -> Dict[str, float]:
        """根据阶梯定价逻辑计算最终售价、划线原价和利润"""
        if cost <= 0:
            return {"price": 0.0, "compare_at_price": 0.0, "profit": 0.0, "margin": 0.0}

        # 匹配对应加价区间
        tier = cls.PRICING_TIERS[-1]
        for t in cls.PRICING_TIERS:
            if t["minCost"] <= cost < t["maxCost"]:
                tier = t
                break

        raw_price = cost * tier["multiplier"] + tier.get("flatFee", 0)

        # 尾数规整 (如 .99)
        if cls.ROUNDING == "99":
            price = math.floor(raw_price) + 0.99
            if price < raw_price:
                price += 1.0
        elif cls.ROUNDING == "95":
            price = math.floor(raw_price) + 0.95
            if price < raw_price:
                price += 1.0
        elif cls.ROUNDING == "integer":
            price = round(raw_price)
        else:
            price = round(raw_price, 2)

        compare_at = math.floor(price * cls.COMPARE_AT_MULTIPLIER) + 0.99
        profit = round(price - cost, 2)
        margin = round((profit / price) * 100, 1) if price > 0 else 0.0

        return {
            "price": round(price, 2),
            "compare_at_price": round(compare_at, 2),
            "profit": profit,
            "margin": margin,
            "applied_tier": tier["name"]
        }

    @classmethod
    def clean_title(cls, raw_title: str) -> str:
        """清洗商品标题：替换品牌词并移除违禁词"""
        if not raw_title:
            return f"{cls.BRAND_NAME} Collection Item"

        title = raw_title.strip()
        for old_w, new_w in cls.REPLACEMENTS.items():
            title = re.sub(rf"\\b{re.escape(old_w)}\\b", new_w, title, flags=re.IGNORECASE)

        for banned in cls.BANNED_KEYWORDS:
            title = re.sub(rf"\\b{re.escape(banned)}\\b", "", title, flags=re.IGNORECASE)

        title = re.sub(r"\\s+", " ", title).strip()
        title = re.sub(r"^[-–|,\\s]+|[-–|,\\s]+$", "", title)

        if cls.BRAND_NAME.lower() not in title.lower():
            title = f"{cls.BRAND_NAME} - {title}"

        return title

    @classmethod
    def clean_description(cls, raw_desc: str) -> str:
        """清洗商品详情：去除原厂售后条款、链接、电话"""
        desc = raw_desc or ""
        for old_w, new_w in cls.REPLACEMENTS.items():
            desc = re.sub(rf"\\b{re.escape(old_w)}\\b", new_w, desc, flags=re.IGNORECASE)

        for banned in cls.BANNED_KEYWORDS:
            desc = re.sub(rf"\\b{re.escape(banned)}\\b", "", desc, flags=re.IGNORECASE)

        # 移除外链与邮箱
        desc = re.sub(r"https?://[^\\s<>\"']+", "", desc)
        desc = re.sub(r"[\\w.-]+@[\\w.-]+\\.\\w+", "", desc)

        # 注入 Casalivo 品牌专属品质承诺
        guarantee_html = (
            f'<div class="casalivo-guarantee" style="margin-top:20px;padding:15px;background:#f8fafc;border-left:4px solid #0f172a;">'
            f'<p><strong>{cls.BRAND_NAME} 质保说明:</strong> 欧洲本地极速发货，全检出库，提供专属无忧售后保障。</p>'
            f'</div>'
        )
        return desc + guarantee_html

    @classmethod
    def format_sku(cls, raw_sku: str) -> str:
        """将原厂 SKU 转换为 Casalivo 品牌编码"""
        clean_sku = str(raw_sku).strip().replace(" ", "-").upper()
        if clean_sku.startswith(cls.SKU_PREFIX.upper()):
            return clean_sku
        return f"{cls.SKU_PREFIX}{clean_sku}"

    @classmethod
    def transform(cls, raw_item: Dict[str, Any]) -> Dict[str, Any]:
        """全流程清洗单个商品"""
        orig_sku = str(raw_item.get("sku") or raw_item.get("originalSku") or "")
        orig_title = str(raw_item.get("title") or raw_item.get("originalTitle") or "")
        cost = float(raw_item.get("costPrice") or raw_item.get("price") or 0.0)
        stock = int(raw_item.get("stock") or 0)
        
        pricing = cls.calculate_price(cost)
        avail_stock = max(0, stock - cls.SAFETY_BUFFER)

        return {
            "sku": cls.format_sku(orig_sku),
            "originalSku": orig_sku,
            "title": cls.clean_title(orig_title),
            "vendor": cls.BRAND_NAME,
            "price": pricing["price"],
            "compare_at_price": pricing["compare_at_price"],
            "stock": avail_stock,
            "raw_stock": stock,
            "description_html": cls.clean_description(raw_item.get("description", "")),
            "images": raw_item.get("images", []),
            "tags": ["Casalivo", "Dropship", "AutoSync"],
        }
`;

  const shopifyClientPy = `"""
Shopify Admin API Client
Supports product batch publishing and inventory level incremental updates.
"""
import requests
from typing import Dict, Any, List, Optional

class ShopifyClient:
    def __init__(self, shop_domain: str, access_token: str, api_version: str = "${shopifyConfig.apiVersion || '2024-04'}"):
        clean_domain = shop_domain.replace("https://", "").replace("http://", "").rstrip("/")
        if "." not in clean_domain:
            clean_domain = f"{clean_domain}.myshopify.com"
        self.base_url = f"https://{clean_domain}/admin/api/{api_version}"
        self.headers = {
            "X-Shopify-Access-Token": access_token,
            "Content-Type": "application/json"
        }

    def verify_connection(self) -> Dict[str, Any]:
        """验证 Shopify 凭证并获取店铺信息"""
        url = f"{self.base_url}/shop.json"
        res = requests.get(url, headers=self.headers, timeout=15)
        res.raise_for_status()
        return res.json().get("shop", {})

    def get_locations(self) -> List[Dict[str, Any]]:
        """获取发货仓库 Location ID"""
        url = f"{self.base_url}/locations.json"
        res = requests.get(url, headers=self.headers, timeout=15)
        res.raise_for_status()
        return res.json().get("locations", [])

    def find_product_by_sku(self, sku: str) -> Optional[Dict[str, Any]]:
        """按 SKU 查找现有商品"""
        url = f"{self.base_url}/products.json?limit=50&fields=id,title,variants"
        res = requests.get(url, headers=self.headers, timeout=20)
        if not res.ok:
            return None
        products = res.json().get("products", [])
        for p in products:
            for v in p.get("variants", []):
                if v.get("sku", "").lower() == sku.lower():
                    return {"product_id": p["id"], "variant_id": v["id"], "inventory_item_id": v["inventory_item_id"]}
        return None

    def publish_or_update_product(self, product_data: Dict[str, Any], location_id: Optional[str] = None) -> Dict[str, Any]:
        """发布或全量更新单个商品"""
        sku = product_data["sku"]
        existing = self.find_product_by_sku(sku)

        payload = {
            "product": {
                "title": product_data["title"],
                "body_html": product_data["description_html"],
                "vendor": product_data["vendor"],
                "tags": ", ".join(product_data.get("tags", ["Casalivo"])),
                "images": [{"src": url} for url in product_data.get("images", [])],
                "variants": [
                    {
                        "sku": sku,
                        "price": str(product_data["price"]),
                        "compare_at_price": str(product_data["compare_at_price"]),
                        "inventory_management": "shopify",
                        "inventory_policy": "deny",
                    }
                ]
            }
        }

        if existing:
            # 更新已有商品
            pid = existing["product_id"]
            payload["product"]["id"] = pid
            payload["product"]["variants"][0]["id"] = existing["variant_id"]
            url = f"{self.base_url}/products/{pid}.json"
            res = requests.put(url, json=payload, headers=self.headers, timeout=30)
            res.raise_for_status()
            prod_res = res.json().get("product", {})
            action = "updated"
        else:
            # 创建新商品
            url = f"{self.base_url}/products.json"
            res = requests.post(url, json=payload, headers=self.headers, timeout=30)
            res.raise_for_status()
            prod_res = res.json().get("product", {})
            action = "created"

        # 设置库存数量
        if location_id and prod_res.get("variants"):
            inv_item_id = prod_res["variants"][0]["inventory_item_id"]
            self.set_inventory_level(location_id, inv_item_id, product_data["stock"])

        return {"action": action, "sku": sku, "id": prod_res.get("id")}

    def set_inventory_level(self, location_id: str, inventory_item_id: int, available: int):
        """精准设置指定仓库的库存数量"""
        url = f"{self.base_url}/inventory_levels/set.json"
        body = {
            "location_id": location_id,
            "inventory_item_id": inventory_item_id,
            "available": available
        }
        res = requests.post(url, json=body, headers=self.headers, timeout=15)
        res.raise_for_status()
        return res.json()
`;

  const syncBotPy = `"""
Casalivo Sync Bot - 主控定时执行入口
Usage:
  python sync_bot.py --mode stock_only   # 仅日常增量同步库存
  python sync_bot.py --mode full         # 全量同步/铺货
  python sync_bot.py --source csv        # 从本地 CSV 表格读取同步
"""
import os
import sys
import argparse
import logging
from dotenv import load_dotenv

from arkswift_api import ArkSwiftClient
from whitewash_engine import WhitewashEngine
from shopify_client import ShopifyClient

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="[%(asctime)s] %(levelname)s: %(message)s",
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler("sync_bot.log", encoding="utf-8")
    ]
)

def run_sync(mode: str = "stock_only", source: str = "api"):
    logging.info("==========================================")
    logging.info(f"Casalivo Sync Bot 启动 | 模式: {mode} | 数据源: {source}")
    logging.info("==========================================")

    # 1. 初始化 Shopify 客户端
    shop_domain = os.getenv("SHOPIFY_SHOP_DOMAIN", "${shopifyConfig.shopDomain}")
    client_id = os.getenv("SHOPIFY_CLIENT_ID", "")
    client_secret = os.getenv("SHOPIFY_CLIENT_SECRET", "")
    location_id = os.getenv("SHOPIFY_LOCATION_ID", "")

    if not shop_domain or not (client_id and client_secret):
        logging.error("缺少 Shopify 凭证：请在 .env 中配置 SHOPIFY_SHOP_DOMAIN / SHOPIFY_CLIENT_ID / SHOPIFY_CLIENT_SECRET")
        return

    # Client Credentials Grant：服务端换票，24h 有效
    token_res = requests.post(
        f"https://{shop_domain}/admin/oauth/access_token",
        data={"grant_type": "client_credentials", "client_id": client_id, "client_secret": client_secret},
        timeout=25,
    )
    token_res.raise_for_status()
    access_token = token_res.json()["access_token"]
    shopify = ShopifyClient(shop_domain, access_token)
    shop_info = shopify.verify_connection()
    logging.info(f"成功连接 Shopify 店铺: {shop_info.get('name')} ({shop_domain})")

    # 2. 获取 ArkSwift 数据
    raw_products = []
    if source == "api":
        api_url = os.getenv("ARKSWIFT_API_URL", "https://api.arkswift.com")
        app_key = os.getenv("ARKSWIFT_APP_KEY") or os.getenv("CLIENT_ID", "")
        app_secret = os.getenv("ARKSWIFT_APP_SECRET") or os.getenv("CLIENT_SECRET", "")
        
        if not app_key or not app_secret:
            logging.warning("未配置 ArkSwift API 凭据，正在使用本地演示/导出数据...")
            # 回退或读取本地表格
        else:
            ark_client = ArkSwiftClient(api_url, app_key, app_secret)
            raw_products = ark_client.fetch_product_inventory(page=1, page_size=50)

    # 3. 洗白与加价处理
    logging.info(f"正在进行数据洗白 (Casalivo) 与阶梯定价计算...")
    success_count = 0
    fail_count = 0

    for item in raw_products:
        try:
            cleansed = WhitewashEngine.transform(item)
            logging.info(f"处理商品: {cleansed['sku']} - 供货价: €{item.get('costPrice', 0)} -> 售价: €{cleansed['price']} (库存: {cleansed['stock']})")

            if mode == "full":
                res = shopify.publish_or_update_product(cleansed, location_id=location_id)
                logging.info(f"  [+] Shopify 推送成功 ({res['action']}): {res['sku']}")
            elif mode == "stock_only":
                existing = shopify.find_product_by_sku(cleansed["sku"])
                if existing and location_id:
                    shopify.set_inventory_level(location_id, existing["inventory_item_id"], cleansed["stock"])
                    logging.info(f"  [√] 库存更新成功: {cleansed['sku']} -> {cleansed['stock']}")
                else:
                    logging.warning(f"  [-] 未在 Shopify 找到 SKU: {cleansed['sku']}，跳过库存更新")

            success_count += 1
        except Exception as e:
            logging.error(f"  [!] 处理商品失败 {item.get('sku')}: {e}")
            fail_count += 1

    logging.info("==========================================")
    logging.info(f"同步完成! 成功: {success_count} 件, 失败: {fail_count} 件")
    logging.info("==========================================")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Casalivo Sync Bot")
    parser.add_argument("--mode", choices=["full", "stock_only"], default="stock_only", help="同步模式: full (全量铺货) 或 stock_only (仅同步库存)")
    parser.add_argument("--source", choices=["api", "csv"], default="api", help="数据源: api 或 csv")
    args = parser.parse_args()

    run_sync(mode=args.mode, source=args.source)
`;

  const runBat = `@echo off
chcp 65001 > nul
echo ========================================================
echo        Casalivo 铺货与库存自动同步系统
echo ========================================================
echo.

cd /d "%~dp0"

REM 检查 Python 环境
where python >nul 2>nul
if %errorlevel% neq 0 (
    echo [错误] 未检测到 Python，请先安装 Python 并添加到 PATH!
    pause
    exit /b 1
)

echo [1/3] 检查并安装依赖库...
pip install -r requirements.txt -q

echo.
echo [2/3] 请选择运行模式:
echo   1. 日常增量同步库存 (推荐每日定时任务执行)
echo   2. 首次全量铺货与价格同步
echo   3. 退出
echo.
set /p choice="请输入选项 (1-3, 默认 1): "

if "%choice%"=="2" (
    echo.
    echo [3/3] 正在执行全量铺货与价格同步...
    python sync_bot.py --mode full
) else if "%choice%"=="3" (
    exit /b 0
) else (
    echo.
    echo [3/3] 正在执行库存增量同步...
    python sync_bot.py --mode stock_only
)

echo.
echo ========================================================
echo 执行完毕！查看 sync_bot.log 获取详细日志。
echo ========================================================
pause
`;

  const requirementsTxt = `requests>=2.28.0
python-dotenv>=1.0.0
`;

  const envExample = `# Casalivo Sync Bot 配置文件
# 重命名此文件为 .env 并填入你的真实凭据

# 接口凭据 (Client ID / Client Secret 或 RSA 密钥对)
CLIENT_ID="your_client_id_or_public_key"
CLIENT_SECRET="your_client_secret_or_private_key"

# ArkSwift API 凭据
ARKSWIFT_API_URL="${arkswiftConfig.apiUrl || 'https://api.arkswift.com'}"
ARKSWIFT_APP_KEY="${arkswiftConfig.appKey || 'your_arkswift_app_key'}"
ARKSWIFT_APP_SECRET="${arkswiftConfig.appSecret || 'your_arkswift_app_secret'}"
ARKSWIFT_SELLER_ID=""

# Shopify 凭据 (必填)
SHOPIFY_SHOP_DOMAIN="${shopifyConfig.shopDomain || 'td5kxa-2d.myshopify.com'}"
SHOPIFY_CLIENT_ID=""
SHOPIFY_CLIENT_SECRET=""
SHOPIFY_API_VERSION="2025-07"
SHOPIFY_LOCATION_ID="${shopifyConfig.locationId || ''}"
`;

  return {
    'sync_bot.py': syncBotPy,
    'arkswift_api.py': arkswiftApiPy,
    'whitewash_engine.py': whitewashEnginePy,
    'shopify_client.py': shopifyClientPy,
    'run_daily_sync.bat': runBat,
    'requirements.txt': requirementsTxt,
    '.env.example': envExample,
  };
}
