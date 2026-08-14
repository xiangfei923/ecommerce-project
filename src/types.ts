export interface ProductType {
  id: string;
  image: string;
  name: string;
  rating: {
    stars: number;
    count: number;
  };
  priceCents: number;
  keywords?: string[];
}

export interface CartItemType {
  productId: string;
  quantity: number;
  deliveryOptionId: string;
  product?: ProductType;
}

export interface DeliveryOptionType {
  id: string;
  deliveryDays: number;
  priceCents: number;
  estimatedDeliveryTimeMs: number;
}

export interface PaymentSummaryType {
  totalItems: number;
  productCostCents: number;
  shippingCostCents: number;
  totalCostBeforeTaxCents: number;
  taxCents: number;
  totalCostCents: number;
}

export interface OrderProductType {
  productId: string;
  quantity: number;
  estimatedDeliveryTimeMs: number;
  product: {
    id: string;
    image: string;
    name: string;
    createdAt?: string;
  };
}

export interface OrderType {
  id: string;
  orderTimeMs: number;
  totalCostCents: number;
  products: OrderProductType[];
}

export interface TrackingOrderType {
  id: string;
  orderTimeMs: number;
  totalCents: number;
  products: OrderProductType[];
}