import { useState } from "react";
import { useNavigate } from "react-router";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { placeOrder, addToCart, deleteCartItem, selectCartItems } from "../../store/cartSlice";
import { formatMoney } from "../../utils/money";
import { Toast } from "../../components/Toast";
import type { PaymentSummaryType, ProductType } from "../../types";

export function PaymentSummary({
  paymentSummary,
  buyNowMode = false,
  buyNowProduct,
  buyNowQuantity = 1,
}: {
  paymentSummary: PaymentSummaryType | null;
  buyNowMode?: boolean;
  buyNowProduct?: ProductType;
  buyNowQuantity?: number;
}) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const cart = useAppSelector(selectCartItems);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const createOrder = async () => {
    if (isPlacingOrder) return; // 防止重复点击
    
    setIsPlacingOrder(true);
    
    try {
      if (buyNowMode && buyNowProduct) {
        // 立即购买模式：不影响购物车的情况下下单
        
        // 1. 保存当前购物车内容
        const savedCart = [...cart];
        
        // 2. 清空购物车
        for (const item of cart) {
          await dispatch(deleteCartItem(item.productId));
        }
        
        // 3. 只添加当前要购买的商品
        await dispatch(addToCart({ 
          productId: buyNowProduct.id, 
          quantity: buyNowQuantity 
        }));
        
        // 4. 等待购物车更新
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // 5. 提交订单（这时购物车里只有当前商品）
        await dispatch(placeOrder());
        
        // 6. 恢复原来的购物车内容
        for (const item of savedCart) {
          await dispatch(addToCart({
            productId: item.productId,
            quantity: item.quantity
          }));
        }
        
        // 7. 跳转到订单页
        navigate("/orders");
      } else {
        // 普通模式：提交订单，下单成功后跳到订单页
        await dispatch(placeOrder());
        navigate("/orders");
      }
    } catch (error) {
      console.error("下单失败:", error);
      setToastMessage("下单失败，请重试");
      setShowToast(true);
    } finally {
      setIsPlacingOrder(false);
    }
  };

  return (
    <>
      {showToast && (
        <Toast
          message={toastMessage}
          onClose={() => setShowToast(false)}
          duration={3000}
        />
      )}
      
      <div className="payment-summary">
        <div className="payment-summary-title">Payment Summary</div>

      {paymentSummary && (
        <>
          <div className="payment-summary-row">
            <div>Items ({paymentSummary.totalItems}):</div>
            <div className="payment-summary-money">
              {formatMoney(paymentSummary.productCostCents)}
            </div>
          </div>

          <div className="payment-summary-row">
            <div>Shipping &amp; handling:</div>
            <div className="payment-summary-money">
              {formatMoney(paymentSummary.shippingCostCents)}
            </div>
          </div>

          <div className="payment-summary-row subtotal-row">
            <div>Total before tax:</div>
            <div className="payment-summary-money">
              {formatMoney(paymentSummary.totalCostBeforeTaxCents)}
            </div>
          </div>

          <div className="payment-summary-row">
            <div>Estimated tax (10%):</div>
            <div className="payment-summary-money">
              {formatMoney(paymentSummary.taxCents)}
            </div>
          </div>

          <div className="payment-summary-row total-row">
            <div>Order total:</div>
            <div className="payment-summary-money">
              {formatMoney(paymentSummary.totalCostCents)}
            </div>
          </div>

          <button
            className="place-order-button button-primary"
            onClick={createOrder}
            disabled={isPlacingOrder}
          >
            {isPlacingOrder ? "Processing..." : "Place your order"}
          </button>
        </>
      )}
    </div>
    </>
  );
}
