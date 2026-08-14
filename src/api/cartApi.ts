import axios from "axios";
import { ENDPOINTS } from "./endpoints";
import type { CartItemType } from "../types";

// 拉取购物车数据（带商品详情）
export async function fetchCartItems(): Promise<CartItemType[]> {
  const response = await axios.get<CartItemType[]>(ENDPOINTS.CART_ITEMS_EXPAND_PRODUCT);
  return response.data;
}

// 把商品加入购物车
export async function addCartItem(productId: string, quantity: number): Promise<void> {
  await axios.post(ENDPOINTS.CART_ITEMS, { productId, quantity });
}

// 删除购物车中的某件商品
export async function deleteCartItem(productId: string): Promise<void> {
  await axios.delete(ENDPOINTS.CART_ITEM(productId));
}

// 修改某件商品的配送方式
export async function updateCartItemDeliveryOption(
  productId: string,
  deliveryOptionId: string
): Promise<void> {
  await axios.put(ENDPOINTS.CART_ITEM(productId), { deliveryOptionId });
}
