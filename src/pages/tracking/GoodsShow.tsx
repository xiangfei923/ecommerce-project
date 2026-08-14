// 负责渲染商品的图片、名称、数量
import type { OrderProductType } from "../../types";

interface GoodsShowProps {
  product: OrderProductType;
}

export function GoodsShow({ product }: GoodsShowProps) {
  return (
    <>
      <div className="product-info">{product.product.name}</div>
      <div className="product-info">Quantity: {product.quantity}</div>
      <img
        className="product-image"
        src={product.product.image}
        alt={product.product.name}
      />
    </>
  );
}
