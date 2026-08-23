import type { ProductType } from "../types";

// 商品型号（variant）类型：后端暂无该字段，这里在前端用 mock 数据补充
export interface ProductVariant {
  id: string;
  name: string;
  priceCents: number;
}

// 型号相对基础价的倍率配置（mock）
const VARIANT_TEMPLATES: { id: string; name: string; multiplier: number }[] = [
  { id: "standard", name: "Standard", multiplier: 1 },
  { id: "deluxe", name: "Deluxe", multiplier: 1.2 },
  { id: "premium", name: "Premium", multiplier: 1.5 },
];

/**
 * 根据商品基础价格，生成一组 mock 型号，不同型号价格不同。
 */
export function getProductVariants(product: ProductType): ProductVariant[] {
  return VARIANT_TEMPLATES.map((template) => ({
    id: template.id,
    name: template.name,
    priceCents: Math.round(product.priceCents * template.multiplier),
  }));
}
