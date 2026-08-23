# 11. 查询订单列表

`GET /api/orders`

## 一句话说明
把用户所有的历史订单查出来，每张订单带上买了哪些东西。

## 什么时候会用到
用户打开**订单列表页** `/orders`。

## 前端会传什么给你

| 参数 | 意思 |
| --- | --- |
| `expand` | 传 `products` 时，顺便把每张订单里的商品也带出来 |

例子：`GET /api/orders?expand=products`

## 你要返回什么（响应，状态码 200）
```json
[
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
]
```

| 字段 | 意思 |
| --- | --- |
| `orderTimeMs` | 下单时间 |
| `totalCostCents` | 这张订单一共多少钱 |
| `products` | 这张订单买的商品；只有传 `expand=products` 才有 |
| `unitPriceCents` | 下单时的单价（是抄下来的，不是现在的价） |

## 后端要做的事（业务规则）
1. 订单按下单时间**倒序**（最新的排最前面）。
2. 商品信息**直接从 `order_item` 里读**（下单时抄好的），不用再去 product 表查。
3. 无订单时返回空数组 `[]`。

## SQL 怎么写
```sql
-- 查所有订单，新的在前
SELECT id, order_time, total_cost_cents
FROM orders
ORDER BY order_time DESC;

-- 查这些订单里的商品明细（用 IN 一次查完）
SELECT order_id, product_id, variant_id, product_name, product_image,
       variant_name, unit_price_cents, quantity, estimated_delivery_at
FROM order_item
WHERE order_id IN (:orderIds);
```

## 可能出错的情况
| 情况 | 怎么办 |
| --- | --- |
| 一张订单都没有 | 返回 `[]` |

## 会用到哪些表
`orders`、`order_item`

## 名词解释 / 提醒
- 商品信息读的是**订单明细里抄下来的快照**，所以就算商品后来改了名、改了价、甚至被删了，历史订单显示的还是当时的样子。这是故意的。
- 现在是单用户；以后做了登录，这里要改成"只查当前用户的订单"。
