"""
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
    BRAND_NAME = "Casalivo"
    SKU_PREFIX = "CSL-"
    SAFETY_BUFFER = 3
    ROUNDING = "99"
    COMPARE_AT_MULTIPLIER = 1.35

    REPLACEMENTS = {
        "SPANISH AOSOM SL": "Casalivo",
        "AOSOM": "Casalivo",
        "Aosom": "Casalivo",
        "HOMCOM": "Casalivo",
        "Homcom": "Casalivo",
        "OUTSUNNY": "Casalivo",
        "Outsunny": "Casalivo",
        "PAWHUT": "Casalivo Pets",
        "PawHut": "Casalivo Pets",
        "VINSETTO": "Casalivo Office",
        "Vinsetto": "Casalivo Office",
    }

    BANNED_KEYWORDS = [
        "Aosom",
        "Homcom",
        "Outsunny",
        "Pawhut",
        "Vinsetto",
        "SoBuy",
        "official store",
        "distributor warranty",
        "manufacturer warranty",
        "garantía del fabricante",
        "tienda oficial",
        "distribuidor oficial",
        "Aosom.es",
        "aosom.es",
        "spanish warehouse",
        "almacén españa",
    ]

    PRICING_TIERS = [
        {"id": "tier-1", "name": "低进价区间 (< €20)", "minCost": 0, "maxCost": 20, "multiplier": 2.5, "flatFee": 0},
        {"id": "tier-2", "name": "中进价区间 (€20 - €50)", "minCost": 20, "maxCost": 50, "multiplier": 2.0, "flatFee": 0},
        {"id": "tier-3", "name": "高进价区间 (> €50)", "minCost": 50, "maxCost": 999999, "multiplier": 1.8, "flatFee": 0},
    ]

    @classmethod
    def calculate_price(cls, cost: float) -> Dict[str, float]:
        if cost <= 0:
            return {"price": 0.0, "compare_at_price": 0.0, "profit": 0.0, "margin": 0.0}

        tier = cls.PRICING_TIERS[-1]
        for t in cls.PRICING_TIERS:
            if t["minCost"] <= cost < t["maxCost"]:
                tier = t
                break

        raw_price = cost * tier["multiplier"] + tier.get("flatFee", 0)

        if cls.ROUNDING == "99":
            price = math.floor(raw_price) + 0.99
            if price < raw_price:
                price += 1.0
        elif cls.ROUNDING == "95":
            price = math.floor(raw_price) + 0.95
            if price < raw_price:
                price += 1.0
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
        if not raw_title:
            return f"{cls.BRAND_NAME} Collection Item"

        title = raw_title.strip()
        for old_w, new_w in cls.REPLACEMENTS.items():
            title = re.sub(rf"\b{re.escape(old_w)}\b", new_w, title, flags=re.IGNORECASE)

        for banned in cls.BANNED_KEYWORDS:
            title = re.sub(rf"\b{re.escape(banned)}\b", "", title, flags=re.IGNORECASE)

        title = re.sub(r"\s+", " ", title).strip()
        title = re.sub(r"^[-–|,\s]+|[-–|,\s]+$", "", title)

        if cls.BRAND_NAME.lower() not in title.lower():
            title = f"{cls.BRAND_NAME} - {title}"

        return title

    @classmethod
    def clean_description(cls, raw_desc: str) -> str:
        desc = raw_desc or ""
        for old_w, new_w in cls.REPLACEMENTS.items():
            desc = re.sub(rf"\b{re.escape(old_w)}\b", new_w, desc, flags=re.IGNORECASE)

        for banned in cls.BANNED_KEYWORDS:
            desc = re.sub(rf"\b{re.escape(banned)}\b", "", desc, flags=re.IGNORECASE)

        desc = re.sub(r"https?://[^\s<>\"']+", "", desc)
        desc = re.sub(r"[\w.-]+@[\w.-]+\.\w+", "", desc)

        guarantee_html = (
            f'<div class="casalivo-guarantee" style="margin-top:20px;padding:15px;background:#f8fafc;border-left:4px solid #0f172a;">'
            f'<p><strong>{cls.BRAND_NAME} 质保说明:</strong> 欧洲本地极速发货，全检出库，提供专属无忧售后保障。</p>'
            f'</div>'
        )
        return desc + guarantee_html

    @classmethod
    def format_sku(cls, raw_sku: str) -> str:
        clean_sku = str(raw_sku).strip().replace(" ", "-").upper()
        if clean_sku.startswith(cls.SKU_PREFIX.upper()):
            return clean_sku
        return f"{cls.SKU_PREFIX}{clean_sku}"

    @classmethod
    def transform(cls, raw_item: Dict[str, Any]) -> Dict[str, Any]:
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
