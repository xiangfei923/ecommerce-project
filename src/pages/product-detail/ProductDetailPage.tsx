import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { useAppDispatch } from "../../store/hooks";
import { addToCart } from "../../store/cartSlice";
import { fetchProductById } from "../../api/productsApi";
import { Header } from "../../components/Header";
import { Toast } from "../../components/Toast";
import { ProductBreadcrumb } from "./ProductBreadcrumb";
import { ProductImage } from "./ProductImage";
import { ProductInfo } from "./ProductInfo";
import { ProductDescription } from "./ProductDescription";
import type { ProductType } from "../../types";
import "./ProductDetailPage.css";

export function ProductDetailPage() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const [product, setProduct] = useState<ProductType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [showToast, setShowToast] = useState(false);

  // 加载商品数据
  useEffect(() => {
    if (!productId) {
      setError("商品 ID 无效");
      setLoading(false);
      return;
    }

    fetchProductById(productId)
      .then((data) => {
        setProduct(data);
        setLoading(false);
      })
      .catch(() => {
        setError("商品加载失败");
        setLoading(false);
      });
  }, [productId]);

  // 加入购物车
  const handleAddToCart = () => {
    if (product) {
      dispatch(addToCart({ productId: product.id, quantity }));
      setShowToast(true);
    }
  };

  // 立即购买
  const handleBuyNow = () => {
    if (product) {
      navigate("/checkout", {
        state: {
          buyNow: true,
          product: product,
          quantity: quantity
        }
      });
    }
  };

  // 加载中状态
  if (loading) {
    return (
      <>
        <Header />
        <div className="product-detail-page">
          <div className="loading">加载中...</div>
        </div>
      </>
    );
  }

  // 错误状态
  if (error || !product) {
    return (
      <>
        <Header />
        <div className="product-detail-page">
          <div className="error">{error || "商品不存在"}</div>
          <Link to="/" className="back-home-link">返回首页</Link>
        </div>
      </>
    );
  }

  // 正常显示
  return (
    <>
      <title>{product.name}</title>
      <Header />
      
      {showToast && (
        <Toast
          message="已加入购物车！"
          onClose={() => setShowToast(false)}
        />
      )}
      
      <div className="product-detail-page">
        <ProductBreadcrumb productName={product.name} />

        <div className="product-detail-container">
          <ProductImage image={product.image} name={product.name} />

          <ProductInfo
            name={product.name}
            rating={product.rating}
            priceCents={product.priceCents}
            quantity={quantity}
            onQuantityChange={setQuantity}
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
          />
        </div>

        <ProductDescription keywords={product.keywords} />
      </div>
    </>
  );
}
