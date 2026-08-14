import { useState, useEffect } from "react";
import { useAppSelector } from "../../store/hooks";
import { selectCartItems, selectCartItemCount } from "../../store/cartSlice";
import { OrderSummary } from "./OrderSummary";
import { PaymentSummary } from "./PaymentSummary";
import { fetchDeliveryOptions, fetchPaymentSummary } from "../../api/checkoutApi";
import type { DeliveryOptionType, PaymentSummaryType } from "../../types";
import "./checkout-header.css";
import "./CheckoutPage.css";

export function CheckoutPage() {
  const [deliveryOptions, setDeliveryOptions] = useState<DeliveryOptionType[]>([]);
  const [paymentSummary, setPaymentSummary] = useState<PaymentSummaryType | null>(null);

  // 读取购物车里的商品列表（用于判断购物车是否变化）
  const cart = useAppSelector(selectCartItems);
  // 读取购物车商品总数量（显示在结账页顶部）
  const totalQuantity = useAppSelector(selectCartItemCount);

  useEffect(() => {
    const fetchCheckoutData = async () => {
      const options = await fetchDeliveryOptions();
      setDeliveryOptions(options);

      const summary = await fetchPaymentSummary();
      setPaymentSummary(summary);
    };

    fetchCheckoutData();
  }, [cart]);

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
              {totalQuantity} items
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
          <OrderSummary deliveryOptions={deliveryOptions} />
          <PaymentSummary paymentSummary={paymentSummary} />
        </div>
      </div>
    </>
  );
}