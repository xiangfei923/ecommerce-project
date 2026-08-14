import axios from "axios";
import { ENDPOINTS } from "./endpoints";
import type { OrderType, TrackingOrderType } from "../types";

// 拉取订单列表（订单页展示用）
export async function fetchOrders(): Promise<OrderType[]> {
  const response = await axios.get<OrderType[]>(ENDPOINTS.ORDERS_EXPAND_PRODUCTS);
  return response.data;
}

// 拉取某个订单的物流跟踪信息
export async function fetchOrderTracking(orderId: string): Promise<TrackingOrderType> {
  const response = await axios.get<TrackingOrderType>(ENDPOINTS.ORDER_TRACKING(orderId));
  return response.data;
}

// 提交订单
export async function placeOrder(): Promise<void> {
  await axios.post(ENDPOINTS.ORDERS);
}
