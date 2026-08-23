import dayjs from "dayjs";
import { useState } from "react";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import { deleteCartItem, selectCartItems } from "../../store/cartSlice";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import type { DeliveryOptionType } from "../../types";
import { formatMoney } from "../../utils/money";
import { DeliveryOptions } from "./DeliveryOptions";

interface OrderSummaryProps {
  deliveryOptions: DeliveryOptionType[];
}

export function OrderSummary({ deliveryOptions }: OrderSummaryProps) {
  // 读取购物车里的所有商品
  const cart = useAppSelector(selectCartItems);
  const dispatch = useAppDispatch();

  // 待删除的商品 id（不为 null 时弹出确认框）
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const pendingItem = cart.find((item) => item.productId === pendingDeleteId);

  const confirmDelete = () => {
    if (pendingDeleteId) {
      dispatch(deleteCartItem(pendingDeleteId));
    }
    setPendingDeleteId(null);
  };

  return (
    <div className="order-summary">
      {deliveryOptions.length > 0 &&
        cart.map((cartItem) => {
          const selectedDeliveryOption = deliveryOptions.find(
            (deliveryOption) => deliveryOption.id === cartItem.deliveryOptionId
          );

          return (
            <div key={cartItem.productId} className="cart-item-container">
              <div className="delivery-date">
                Delivery date:{" "}
                {selectedDeliveryOption &&
                  dayjs(selectedDeliveryOption.estimatedDeliveryTimeMs).format(
                    "dddd, MMMM D"
                  )}
              </div>

              <div className="cart-item-details-grid">
                {/* 增加安全判断，防止 product 为 undefined 报错 */}
                {cartItem.product && (
                  <img
                    className="product-image"
                    src={cartItem.product.image}
                    alt={cartItem.product.name}
                  />
                )}

                <div className="cart-item-details">
                  <div className="product-name">{cartItem.product?.name}</div>
                  <div className="product-price">
                    {cartItem.product ? formatMoney(cartItem.product.priceCents) : ""}
                  </div>
                  <div className="product-quantity">
                    <span>
                      Quantity:{" "}
                      <span className="quantity-label">{cartItem.quantity}</span>
                    </span>

                    <button type="button" className="cart-item-action update-quantity-link">
                      <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
                        <path
                          fill="currentColor"
                          d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"
                        />
                      </svg>
                      Update
                    </button>

                    <button
                      type="button"
                      className="cart-item-action delete-quantity-link"
                      onClick={() => setPendingDeleteId(cartItem.productId)}
                    >
                      <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
                        <path
                          fill="currentColor"
                          d="M6 7h12l-1 14H7L6 7zm3-3h6l1 2h4v2H2V6h4l1-2z"
                        />
                      </svg>
                      Delete
                    </button>
                  </div>
                </div>

                <DeliveryOptions
                  cartItem={cartItem}
                  deliveryOptions={deliveryOptions}
                />
              </div>
            </div>
          );
        })}

      <ConfirmDialog
        open={pendingDeleteId !== null}
        title="Remove item"
        message={
          pendingItem?.product
            ? `Are you sure you want to remove "${pendingItem.product.name}" from your cart?`
            : "Are you sure you want to remove this item from your cart?"
        }
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        onCancel={() => setPendingDeleteId(null)}
      />
    </div>
  );
}
