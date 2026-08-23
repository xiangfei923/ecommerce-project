# 12. 查询订单详情 / 物流

`GET /api/orders/{orderId}`

## 一句话说明
根据订单 id，查出**这一张**订单的详情，用来显示物流追踪。

## 什么时候会用到
用户在订单页点了某张订单的 "Track package"，进入**物流追踪页** `/tracking/某个订单id`。

## 前端会传什么给你
路径里带订单 id：

| 参数 | 意思 |
| --- | --- |
| `orderId` | 哪张订单（路径里） |

还可以带：

| 参数 | 意思 |
| --- | --- |
| `expand` | 传 `products` 时带出商品明细 |

例子：`GET /api/orders/order-uuid?expand=products`

## 你要返回什么（响应，状态码 200）
一张订单对象（和订单列表里的一条一样）：
```json
{
  "id": "order-uuid",
  "orderTimeMs": 1690000000000,
  "totalCostCents": 8293,
  "products": [
    { "productId": "3ebe75dc-...", "variantId": "v2-uuid", "quantity": 2,
      "estimatedDeliveryTimeMs": 1690600000000,
      "product": { "id": "3ebe75dc-...", "name": "2 Piece White Dinner Plate Set",
                   "image": "images/products/elegant-white-dinner-plate-set.jpg" },
      "variantName": "Deluxe", "unitPriceCents": 2480 }
  ]
}
```

## 后端要做的事（业务规则）
1. 订单 id 查不到就返回 404。
2. 商品明细一样从 `order_item` 快照里读。
3. **"到货没到货"这种进度状态不用你返回**——前端会用"预计送达时间"和"现在时间"自己比出来（Preparing / Shipped / Delivered）。

## SQL 怎么写
```sql
SELECT id, order_time, total_cost_cents
FROM orders WHERE id = :orderId;

SELECT product_id, variant_id, product_name, product_image, variant_name,
       unit_price_cents, quantity, estimated_delivery_at
FROM order_item WHERE order_id = :orderId;
```

## 可能出错的情况
| 情况 | 怎么办 |
| --- | --- |
| 订单不存在 | 404，`code=ORDER_NOT_FOUND` |
| orderId 格式不对 | 400 |

## 会用到哪些表
`orders`、`order_item`

## 备注
前端的 `TrackingPage` 已经按这个返回结构在用了，进度状态是它自己在 `getDeliverStatus` 里算的，后端不用操心。
