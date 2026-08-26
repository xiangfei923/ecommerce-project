import { useState, type ChangeEvent } from "react";
import { Link } from "react-router";
import { useAppDispatch } from "../../store/hooks";
import { addToCart } from "../../store/cartSlice";
import { formatMoney } from "../../utils/money";
import type { ProductType } from "../../types";

interface ProductProps {
  product: ProductType;
}

export function Product({ product }: ProductProps) {
  const [quantity, setQuantity] = useState<number>(1);
  const dispatch = useAppDispatch();

  const handleAddToCart = async () => {
    try {
      // 请求成功后再把数量重置为 1
      await dispatch(addToCart({ productId: product.id, quantity })).unwrap();
      setQuantity(1);
    } catch {
      // 请求失败时保留用户选择的数量，不重置
    }
  };

  const selectQuantity = (event: ChangeEvent<HTMLSelectElement>) => {
    setQuantity(Number(event.target.value));
  };

  return (
    <div className="product-container" data-testid="product-container">
      {/* 商品图片和名称可点击跳转到详情页 */}
      <Link to={`/product/${product.id}`} className="product-link">
        <div className="product-image-container">
          {/* 懒加载：只加载可见区域的图片 */}
          <img
            className="product-image"
            data-testid="product-image"
            src={product.image}
            alt={product.name}
            loading="lazy"
          />
        </div>

        <div className="product-name limit-text-to-2-lines">{product.name}</div>
      </Link>

      <div className="product-rating-container">
        <img
          className="product-rating-stars"
          data-testid="product-rating-stars-image"
          src={`images/ratings/rating-${product.rating.stars * 10}.png`}
          alt="Rating"
          loading="lazy"
        />
        <div className="product-rating-count link-primary">
          {product.rating.count}
        </div>
      </div>

      <div className="product-price">{formatMoney(product.priceCents)}</div>

      <div className="product-quantity-container">
        <select value={quantity} onChange={selectQuantity}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
            <option key={num} value={num}>
              {num}
            </option>
          ))}
        </select>
      </div>

      <div className="product-spacer"></div>

      <button
        className="add-to-cart-button button-primary"
        onClick={handleAddToCart}
      >
        Add to Cart
      </button>
    </div>
  );
}
