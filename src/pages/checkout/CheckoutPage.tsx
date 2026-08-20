import { useState, useEffect } from "react";
import { useLocation } from "react-router";
import { useAppSelector } from "../../store/hooks";
import { selectCartItems, selectCartItemCount } from "../../store/cartSlice";
import { OrderSummary } from "./OrderSummary";
import { PaymentSummary } from "./PaymentSummary";
import { fetchDeliveryOptions, fetchPaymentSummary } from "../../api/checkoutApi";
import type { DeliveryOptionType, PaymentSummaryType, ProductType } from "../../types";
import "./checkout-header.css";
import "./CheckoutPage.css";

export function CheckoutPage() {
  const location = useLocation();
  const [deliveryOptions, setDeliveryOptions] = useState<DeliveryOptionType[]>([]);
  const [paymentSummary, setPaymentSummary] = useState<PaymentSummaryType | null>(null);

  // 读取购物车里的商品列表（用于判断购物车是否变化）
  const cart = useAppSelector(selectCartItems);
  // 读取购物车商品总数量（显示在结账页顶部）
  const totalQuantity = useAppSelector(selectCartItemCount);

  // 检查是否是"立即购买"模式
  const buyNowMode = location.state?.buyNow === true;
  const buyNowProduct: ProductType | undefined = location.state?.product;
  const initialBuyNowQuantity: number = location.state?.quantity || 1;
  
  // 立即购买模式下的本地状态
  const [buyNowQuantity, setBuyNowQuantity] = useState(initialBuyNowQuantity);
  const [buyNowShippingCost, setBuyNowShippingCost] = useState(0);

  // 处理配送方式变化（立即购买模式）
  const handleDeliveryChange = (deliveryOptionId: string, shippingCost: number) => {
    setBuyNowShippingCost(shippingCost);
  };
  
  // 处理数量变化（立即购买模式）
  const handleQuantityChange = (newQuantity: number) => {
    setBuyNowQuantity(newQuantity);
  };

  useEffect(() => {
    const fetchCheckoutData = async () => {
      const options = await fetchDeliveryOptions();
      setDeliveryOptions(options);

      // 立即购买模式：手动计算支付摘要
      if (buyNowMode && buyNowProduct) {
        const productCost = buyNowProduct.priceCents * buyNowQuantity;
        const shippingCost = buyNowShippingCost; // 使用当前选择的配送费用
        const totalBeforeTax = productCost + shippingCost;
        const tax = Math.round(totalBeforeTax * 0.1);
        const total = totalBeforeTax + tax;

        setPaymentSummary({
          totalItems: buyNowQuantity,
          productCostCents: productCost,
          shippingCostCents: shippingCost,
          totalCostBeforeTaxCents: totalBeforeTax,
          taxCents: tax,
          totalCostCents: total
        });
      } else {
        // 普通模式：从后端获取支付摘要
        const summary = await fetchPaymentSummary();
        setPaymentSummary(summary);
      }
    };

    fetchCheckoutData();
  }, [cart, buyNowMode, buyNowProduct, buyNowQuantity, buyNowShippingCost]);

  return (
    <>
      <title>Checkout</title>

      <div className="checkout-header">
        <div className="header-content">
          <div className="checkout-header-left-section">
            <a href="/">
              <img className="logo" src="images/logo.png" alt="logo" />
              <img className="mobile-logo" src="images/mobile-logo.png" alt="mobile-logo" />
            </a>
          </div>

          <div className="checkout-header-middle-section">
            Checkout (
            <a className="return-to-home-link" href="/">
              {buyNowMode ? buyNowQuantity : totalQuantity} items
            </a>
            )
          </div>

          <div className="checkout-header-right-section">
            <img src="images/icons/checkout-lock-icon.png" alt="lock-icon" />
          </div>
        </div>
      </div>

      <div className="checkout-page">
        <div className="page-title">Review your order</div>

        <div className="checkout-grid">
          <OrderSummary 
            deliveryOptions={deliveryOptions} 
            buyNowMode={buyNowMode}
            buyNowProduct={buyNowProduct}
            buyNowQuantity={buyNowQuantity}
            onDeliveryChange={handleDeliveryChange}
            onQuantityChange={handleQuantityChange}
          />
          <PaymentSummary 
            paymentSummary={paymentSummary}
            buyNowMode={buyNowMode}
            buyNowProduct={buyNowProduct}
            buyNowQuantity={buyNowQuantity}
          />
        </div>
      </div>
    </>
  );
}