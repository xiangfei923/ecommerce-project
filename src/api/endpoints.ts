// 后端接口路径统一定义在这里，避免字符串散落在各个组件里
export const ENDPOINTS = {
  PRODUCTS: "/api/products",

  CART_ITEMS: "/api/cart-items",
  CART_ITEMS_EXPAND_PRODUCT: "/api/cart-items?expand=product",
  CART_ITEM: (productId: string) => `/api/cart-items/${productId}`,

  ORDERS: "/api/orders",
  ORDERS_EXPAND_PRODUCTS: "/api/orders?expand=products",
  ORDER_TRACKING: (orderId: string) => `/api/orders/${orderId}?expand=products`,

  DELIVERY_OPTIONS_EXPAND: "/api/delivery-options?expand=estimatedDeliveryTime",
  PAYMENT_SUMMARY: "/api/payment-summary",
} as const;
