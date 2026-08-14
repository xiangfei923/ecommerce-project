import axios from "axios";
import { ENDPOINTS } from "./endpoints";
import type { DeliveryOptionType, PaymentSummaryType } from "../types";

// 拉取可选的配送方式（含预计送达时间）
export async function fetchDeliveryOptions(): Promise<DeliveryOptionType[]> {
  const response = await axios.get<DeliveryOptionType[]>(ENDPOINTS.DELIVERY_OPTIONS_EXPAND);
  return response.data;
}

// 拉取结账页的费用汇总
export async function fetchPaymentSummary(): Promise<PaymentSummaryType> {
  const response = await axios.get<PaymentSummaryType>(ENDPOINTS.PAYMENT_SUMMARY);
  return response.data;
}
