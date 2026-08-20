import dayjs from "dayjs";
import { useState } from "react";
import { useAppDispatch } from "../../store/hooks";
import { updateDeliveryOption } from "../../store/cartSlice";
import { formatMoney } from "../../utils/money";
import type { CartItemType, DeliveryOptionType } from "../../types";

interface DeliveryOptionsProps {
  cartItem: CartItemType;
  deliveryOptions: DeliveryOptionType[];
  buyNowMode?: boolean;
  onDeliveryChange?: (deliveryOptionId: string, shippingCost: number) => void;
}

export function DeliveryOptions({ 
  cartItem, 
  deliveryOptions, 
  buyNowMode = false,
  onDeliveryChange 
}: DeliveryOptionsProps) {
  const dispatch = useAppDispatch();
  
  // 立即购买模式下使用本地状态
  const [selectedDeliveryId, setSelectedDeliveryId] = useState(cartItem.deliveryOptionId);

  return (
    <div className="delivery-options">
      <div className="delivery-options-title">Choose a delivery option:</div>
      {deliveryOptions.map((deliveryOption) => {
        let priceString = "FREE Shipping";

        if (deliveryOption.priceCents > 0) {
          priceString = `${formatMoney(deliveryOption.priceCents)} - Shipping`;
        }

        const handleUpdateDelivery = () => {
          if (buyNowMode) {
            // 立即购买模式：更新本地状态，并通知父组件
            setSelectedDeliveryId(deliveryOption.id);
            onDeliveryChange?.(deliveryOption.id, deliveryOption.priceCents);
          } else {
            // 购物车模式：更新 Redux 状态
            dispatch(
              updateDeliveryOption({
                productId: cartItem.productId,
                deliveryOptionId: deliveryOption.id,
              })
            );
          }
        };

        // 判断是否选中：立即购买模式用本地状态，购物车模式用 cartItem
        const isChecked = buyNowMode 
          ? deliveryOption.id === selectedDeliveryId
          : deliveryOption.id === cartItem.deliveryOptionId;

        return (
          <div key={deliveryOption.id} className="delivery-option" onClick={handleUpdateDelivery}>
            <input
              type="radio"
              checked={isChecked}
              onChange={() => {}}
              className="delivery-option-input"
              name={`delivery-option-${cartItem.productId}`}
            />
            <div>
              <div className="delivery-option-date">
                {dayjs(deliveryOption.estimatedDeliveryTimeMs).format("dddd, MMMM D")}
              </div>
              <div className="delivery-option-price">{priceString}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}