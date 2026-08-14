import dayjs from "dayjs";
import { useAppDispatch } from "../../store/hooks";
import { updateDeliveryOption } from "../../store/cartSlice";
import { formatMoney } from "../../utils/money";
import type { CartItemType, DeliveryOptionType } from "../../types";

interface DeliveryOptionsProps {
  cartItem: CartItemType;
  deliveryOptions: DeliveryOptionType[];
}

export function DeliveryOptions({ cartItem, deliveryOptions }: DeliveryOptionsProps) {
  const dispatch = useAppDispatch();

  return (
    <div className="delivery-options">
      <div className="delivery-options-title">Choose a delivery option:</div>
      {deliveryOptions.map((deliveryOption) => {
        let priceString = "FREE Shipping";

        if (deliveryOption.priceCents > 0) {
          priceString = `${formatMoney(deliveryOption.priceCents)} - Shipping`;
        }

        const handleUpdateDelivery = () => {
          dispatch(
            updateDeliveryOption({
              productId: cartItem.productId,
              deliveryOptionId: deliveryOption.id,
            })
          );
        };

        return (
          <div key={deliveryOption.id} className="delivery-option" onClick={handleUpdateDelivery}>
            <input
              type="radio"
              checked={deliveryOption.id === cartItem.deliveryOptionId}
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