import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { selectCartItems, deleteCartItem } from "../../store/cartSlice";
import { CartItemCard } from "./CartItemCard";
import type { DeliveryOptionType, ProductType, CartItemType } from "../../types";

interface OrderSummaryProps {
  deliveryOptions: DeliveryOptionType[];
  buyNowMode?: boolean;
  buyNowProduct?: ProductType;
  buyNowQuantity?: number;
  onDeliveryChange?: (deliveryOptionId: string, shippingCost: number) => void;
  onQuantityChange?: (newQuantity: number) => void;
}

export function OrderSummary({ 
  deliveryOptions, 
  buyNowMode = false,
  buyNowProduct,
  buyNowQuantity = 1,
  onDeliveryChange,
  onQuantityChange
}: OrderSummaryProps) {
  const cart = useAppSelector(selectCartItems);
  const dispatch = useAppDispatch();

  // 如果是"立即购买"模式，创建临时的购物车项
  const itemsToDisplay: CartItemType[] = buyNowMode && buyNowProduct
    ? [{
        productId: buyNowProduct.id,
        quantity: buyNowQuantity,
        deliveryOptionId: deliveryOptions[0]?.id || "1",
        product: buyNowProduct
      }]
    : cart;

  return (
    <div className="order-summary">
      {deliveryOptions.length > 0 &&
        itemsToDisplay.map((cartItem) => (
          <CartItemCard
            key={cartItem.productId}
            cartItem={cartItem}
            deliveryOptions={deliveryOptions}
            buyNowMode={buyNowMode}
            onDelete={() => {
              if (!buyNowMode) {
                dispatch(deleteCartItem(cartItem.productId));
              }
            }}
            onQuantityChange={onQuantityChange}
            onDeliveryChange={onDeliveryChange}
          />
        ))}
    </div>
  );
}