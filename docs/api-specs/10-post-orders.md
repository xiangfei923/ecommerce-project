# 10. 下单

`POST /api/orders`

## 一句话说明
把购物车里的东西变成一张正式订单，然后清空购物车。

## 什么时候会用到
用户在**结算页**点了 "Place Order"（下单）。

## 前端会传什么给你
不用传 Body。买什么、买几个，后端自己去购物车里拿。

例子：`POST /api/orders`

## 你要返回什么（响应，状态码 201）
返回刚生成的订单（结构和"订单详情"一样）：
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

## 后端要做的事（这 4 步必须一起成功，缺一不可）
1. **算总价**：和 `09 费用汇总` 一样（商品 + 运费 + 税）。
2. **建订单**：往 `orders` 表插一条，记下单时间和总价。
3. **抄一份明细（快照）**：购物车每一项抄进 `order_item`，把当时的**单价、商品名、图片、型号名**都存下来。
4. **清空购物车**：把 `cart_item` 全删掉。
5. 如果购物车是空的，不让下单，返回 400。

> **为什么要"抄一份"？** 因为商品以后可能涨价，但你已经买过的订单金额**不能变**。所以下单那一刻，把价格、名字都抄一份存进订单，以后查订单就看这份抄件，不受商品改价影响。

## SQL 怎么写
```sql
-- ① 建订单
INSERT INTO orders (id, order_time, total_cost_cents)
VALUES (UUID(), NOW(3), :totalCostCents);

-- ② 把购物车每项抄进订单明细（INSERT ... SELECT 一次搞定）
INSERT INTO order_item
  (order_id, product_id, variant_id, product_name, product_image, variant_name,
   unit_price_cents, quantity, delivery_option_id, estimated_delivery_at)
SELECT :orderId, c.product_id, c.variant_id, p.name, p.image, v.name,
       COALESCE(v.price_cents, p.base_price_cents), c.quantity, c.delivery_option_id,
       DATE_ADD(NOW(3), INTERVAL d.delivery_days DAY)
FROM cart_item c
JOIN product p              ON p.id = c.product_id
LEFT JOIN product_variant v ON v.id = c.variant_id
JOIN delivery_option d      ON d.id = c.delivery_option_id;

-- ③ 清空购物车
DELETE FROM cart_item;
```

## 可能出错的情况
| 情况 | 怎么办 |
| --- | --- |
| 购物车是空的 | 400，`code=CART_EMPTY` |
| 中间某一步失败 | **全部回滚**，订单和购物车都当没发生过 |

## 会用到哪些表
`orders`、`order_item`、`cart_item`、`product`、`product_variant`、`delivery_option`

## 名词解释（新手重点看这里）
- **事务（Transaction）**：把好几步操作捆成一个整体，"要么全部成功，要么全部不做"。这里 4 步必须捆在一起——不能出现"订单建好了但购物车没清空"这种半截状态。在 Spring 里，给这个方法加一个 `@Transactional` 注解就行。
- **快照（Snapshot）**：把当前的数据"拍照存档"。这里指把下单时的价格、名字抄一份存进订单明细。
- **INSERT ... SELECT**：一种写法，直接把"查出来的结果"插入到另一张表，不用先查出来再一条条插，省事又快。
