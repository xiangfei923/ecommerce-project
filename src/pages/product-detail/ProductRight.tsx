import { formatMoney } from "../../utils/money";

interface ProductRightProps {
  name: string;
  rating: {
    stars: number;
    count: number;
  };
  priceCents: number;
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  onAddToCart: () => void;
  onBuyNow: () => void;
}

export function ProductRight({
  name,
  rating,
  priceCents,
  quantity,
  onQuantityChange,
  onAddToCart,
  onBuyNow,
}: ProductRightProps) {
  return (
    <div className="product-info-section">
      {/* 商品标题 */}
      <h1 className="product-title">{name}</h1>

      {/* 评分 */}
      <div className="product-rating">
        <img
          src={`/images/ratings/rating-${rating.stars * 10}.png`}
          alt="Rating"
          className="rating-stars"
        />
        <span className="rating-count">({rating.count} 评价)</span>
      </div>

      {/* 价格 */}
      <div className="product-price-section">
        <span className="price-label">价格：</span>
        <span className="product-price">{formatMoney(priceCents)}</span>
      </div>

      {/* 库存 */}
      <div className="product-stock">
        <span className="stock-available">有货</span>
      </div>

      {/* 数量选择 */}
      <div className="quantity-section">
        <label>数量：</label>
        <select
          value={quantity}
          onChange={(e) => onQuantityChange(Number(e.target.value))}
          className="quantity-selector"
        >
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
            <option key={num} value={num}>
              {num}
            </option>
          ))}
        </select>
      </div>

      {/* 操作按钮 */}
      <div className="action-buttons">
        <button
          className="add-to-cart-btn button-primary"
          onClick={onAddToCart}
        >
          加入购物车
        </button>
        <button
          className="buy-now-btn button-secondary"
          onClick={onBuyNow}
        >
          立即购买
        </button>
      </div>
    </div>
  );
}
