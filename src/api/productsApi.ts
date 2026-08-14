import axios from "axios";
import { ENDPOINTS } from "./endpoints";
import type { ProductType } from "../types";

// 拉取商品列表（首页展示用）
export async function fetchProducts(): Promise<ProductType[]> {
  const response = await axios.get<ProductType[]>(ENDPOINTS.PRODUCTS);
  return response.data;
}
