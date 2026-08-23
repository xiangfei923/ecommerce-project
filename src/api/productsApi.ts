import axios from "axios";
import type { ProductType } from "../types";
import { ENDPOINTS } from "./endpoints";

// 拉取商品列表（商品列表页展示用）
export async function fetchProducts(): Promise<ProductType[]> {
  const response = await axios.get<ProductType[]>(ENDPOINTS.PRODUCTS);
  return response.data;
}

// 根据 id 拉取单个商品（商品详情页用）
// 后端暂无单商品接口，这里先从商品列表中查找
export async function fetchProductById(
  id: string,
): Promise<ProductType | undefined> {
  const products = await fetchProducts();
  return products.find((product) => product.id === id);
}
