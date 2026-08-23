import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { Link, useParams } from "react-router";
import { fetchProductById } from "../../api/productsApi";
import { getProductVariants } from "../../data/productVariants";
import { addToCart } from "../../store/cartSlice";
import { useAppDispatch } from "../../store/hooks";
import type { ProductType } from "../../types";
import { formatMoney } from "../../utils/money";
import "./ProductDetailPage.scss";

export function ProductDetailPage() {
  const { productId } = useParams();
  const dispatch = useAppDispatch();

  const [product, setProduct] = useState<ProductType | null>(null);
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [variantId, setVariantId] = useState<string>("");
  const [added, setAdded] = useState<boolean>(false);

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");

    fetchProductById(productId ?? "")
      .then((data) => {
        if (cancelled) return;
        if (data) {
          setProduct(data);
          setStatus("success");
        } else {
          setStatus("error");
        }
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, [productId]);

  // 根据商品生成型号（mock），默认选中第一个
  const variants = useMemo(
    () => (product ? getProductVariants(product) : []),
    [product],
  );

  useEffect(() => {
    if (variants.length > 0) {
      setVariantId(variants[0].id);
    }
  }, [variants]);

  const selectedVariant =
    variants.find((variant) => variant.id === variantId) ?? variants[0];

  const handleAddToCart = () => {
    if (!product) return;
    dispatch(addToCart({ productId: product.id, quantity }));
    setAdded(true);
    window.setTimeout(() => setAdded(false), 2000);
  };

  if (status === "loading") {
    return (
      <div className="product-detail-page">
        <div className="product-detail-message">Loading ...</div>
      </div>
    );
  }

  if (status === "error" || !product) {
    return (
      <div className="product-detail-page">
        <div className="product-detail-message">
          <Link className="back-to-products-link link-primary" to="/products">
            Back to products
          </Link>
          Couldn't find this product.
        </div>
      </div>
    );
  }

  return (
    <>
      <title>{product.name}</title>
      <div className="product-detail-page">
        <Link className="back-to-products-link link-primary" to="/products">
          Back to products
        </Link>

        <div className="product-detail-grid">
          <div className="product-detail-image-container">
            <img src={product.image} alt={product.name} />
          </div>

          <div className="product-detail-info">
            <h1 className="product-detail-name">{product.name}</h1>

            <div className="product-detail-rating">
              <img
                className="product-detail-rating-stars"
                src={`images/ratings/rating-${product.rating.stars * 10}.png`}
                alt="Rating"
              />
              <span className="link-primary">{product.rating.count}</span>
            </div>

            <div className="product-detail-price">
              {formatMoney(selectedVariant?.priceCents ?? product.priceCents)}
            </div>

            <div className="product-detail-field">
              <label htmlFor="variant-select">Model</label>
              <select
                id="variant-select"
                value={variantId}
                onChange={(event: ChangeEvent<HTMLSelectElement>) =>
                  setVariantId(event.target.value)
                }
              >
                {variants.map((variant) => (
                  <option key={variant.id} value={variant.id}>
                    {variant.name} - {formatMoney(variant.priceCents)}
                  </option>
                ))}
              </select>
            </div>

            <div className="product-detail-field">
              <label htmlFor="quantity-select">Quantity</label>
              <select
                id="quantity-select"
                value={quantity}
                onChange={(event: ChangeEvent<HTMLSelectElement>) =>
                  setQuantity(Number(event.target.value))
                }
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <option key={num} value={num}>
                    {num}
                  </option>
                ))}
              </select>
            </div>

            {product.keywords && product.keywords.length > 0 && (
              <div className="product-detail-keywords">
                {product.keywords.map((keyword) => (
                  <span key={keyword} className="product-detail-keyword">
                    {keyword}
                  </span>
                ))}
              </div>
            )}

            <button
              className="add-to-cart-button button-primary"
              onClick={handleAddToCart}
            >
              Add to Cart
            </button>

            {added && (
              <div className="added-to-cart-message">
                <img src="images/icons/checkmark.png" alt="" />
                Added to cart
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
