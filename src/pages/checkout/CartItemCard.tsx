import dayjs from "dayjs";
import { useState } from "react";
import { formatMoney } from "../../utils/money";
import { DeliveryOptions } from "./DeliveryOptions";
import { QuantityEditor } from "./QuantityEditor";
import type { DeliveryOptionType, CartItemType } from "../../types";

interface CartItemCardProps {
  cartItem: CartItemType;
  deliveryOptions: DeliveryOptionType[];
  buyNowMode: boolean;
  onDelete: () => void;
  onQuantityChange?: (newQuantity: number) => void;
  onDeliveryChange?: (deliveryOptionId: string, shippingCost: number) => void;
}

export function CartItemCard({
  cartItem,
  deliveryOptions,
  buyNowMode,
  onDelete,
  onQuantityChange,
  onDeliveryChange,
}: CartItemCardProps) {
  const [isEditingQuantity, setIsEditingQuantity] = useState(false);
  const [editQuantity, setEditQuantity] = useState(cartItem.quantity);

  // 找到选中的配送方式
  const selectedDeliveryOption = deliveryOptions.find(
    (option) => option.id === cartItem.deliveryOptionId
  );

  // 开始编辑数量
  const handleEditClick = () => {
    if (buyNowMode) {
      setIsEditingQuantity(true);
      setEditQuantity(cartItem.quantity);
    }
  };

  // 保存数量
  const handleSaveQuantity = () => {
    if (buyNowMode && editQuantity > 0 && editQuantity <= 10) {
      onQuantityChange?.(editQuantity);
      setIsEditingQuantity(false);
    }
  };

  // 取消编辑
  const handleCancelEdit = () => {
    setIsEditingQuantity(false);
    setEditQuantity(cartItem.quantity);
  };

  return (
    <div className="cart-item-container">
      {/* 配送日期 */}
      <div className="delivery-date">
        Delivery date:{" "}
        {selectedDeliveryOption &&
          dayjs(selectedDeliveryOption.estimatedDeliveryTimeMs).format(
            "dddd, MMMM D"
          )}
      </div>

      <div className="cart-item-details-grid">
        {/* 商品图片 */}
        {cartItem.product && (
          <img
            className="product-image"
            src={cartItem.product.image}
            alt={cartItem.product.name}
            loading="lazy"
          />
        )}

        {/* 商品信息 */}
        <div className="cart-item-details">
          <div className="product-name">{cartItem.product?.name}</div>
          <div className="product-price">
            {cartItem.product ? formatMoney(cartItem.product.priceCents) : ""}
          </div>

          <div className="product-quantity">
            <QuantityEditor
              quantity={cartItem.quantity}
              isEditing={isEditingQuantity}
              editQuantity={editQuantity}
              buyNowMode={buyNowMode}
              onEdit={handleEditClick}
              onSave={handleSaveQuantity}
              onCancel={handleCancelEdit}
              onQuantityChange={setEditQuantity}
              onDelete={onDelete}
            />
          </div>
        </div>

        {/* 配送选项 */}
        <DeliveryOptions
          cartItem={cartItem}
          deliveryOptions={deliveryOptions}
          buyNowMode={buyNowMode}
          onDeliveryChange={onDeliveryChange}
        />
      </div>
    </div>
  );
}
