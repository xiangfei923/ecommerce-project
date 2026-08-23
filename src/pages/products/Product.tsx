import { Link } from "react-router";
import { LazyImage } from "../../components/LazyImage";
import type { ProductType } from "../../types";
import { formatMoney } from "../../utils/money";

interface ProductProps {
  product: ProductType;
}

// 商品卡片：点击整卡跳转到商品详情页，不再直接加入购物车
export function Product({ product }: ProductProps) {
  return (
    <Link
      to={`/products/${product.id}`}
      className="product-container"
      data-testid="product-container"
    >
      <div className="product-image-container">
        <LazyImage
          className="product-image"
          data-testid="product-image"
          src={product.image}
          alt={product.name}
        />
      </div>

      <div className="product-name limit-text-to-2-lines">{product.name}</div>

      <div className="product-rating-container">
        <img
          className="product-rating-stars"
          data-testid="product-rating-stars-image"
          src={`images/ratings/rating-${product.rating.stars * 10}.png`}
          alt="Rating"
        />
        <div className="product-rating-count link-primary">
          {product.rating.count}
        </div>
      </div>

      <div className="product-price">{formatMoney(product.priceCents)}</div>

      <div className="product-spacer"></div>

      <button className="view-detail-button button-primary">View Details</button>
    </Link>
  );
}
