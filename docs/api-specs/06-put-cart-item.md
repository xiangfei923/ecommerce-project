# 06. 修改购物车项

`PUT /api/cart-items/{productId}`

## 一句话说明
改购物车里某一项的**数量**或**配送方式**。

## 什么时候会用到
用户在**结算页**改了某个商品的数量，或换了另一种快递。

## 前端会传什么给你
路径里带商品 id：

| 参数 | 意思 |
| --- | --- |
| `productId` | 要改哪一项（路径里） |

Body 里带要改的内容（两个都可选，改哪个传哪个）：
```json
{ "quantity": 3, "deliveryOptionId": "2" }
```

| 字段 | 意思 | 必填 |
| --- | --- | --- |
| `quantity` | 新数量（1~10） | 否 |
| `deliveryOptionId` | 新配送方式 | 否 |

## 你要返回什么（响应，状态码 200）
```json
{ "id": 12, "productId": "3ebe75dc-...", "variantId": "v2-uuid",
  "quantity": 3, "deliveryOptionId": "2" }
```

## 后端要做的事（业务规则）
1. 这一项得存在，不存在返回 404。
2. **前端传了哪个字段就改哪个**，没传的保持原样。
3. 传了 `quantity` 要检查是 1~10。
4. 传了 `deliveryOptionId` 要检查是有效的配送方式。

## SQL 怎么写
```sql
UPDATE cart_item
SET quantity = COALESCE(:quantity, quantity),                     -- 没传就保持原值
    delivery_option_id = COALESCE(:deliveryOptionId, delivery_option_id)
WHERE product_id = :productId;
```
> `COALESCE(:quantity, quantity)` 的意思：如果前端传了新数量就用新的，没传（是 NULL）就还用数据库里原来的。这样一条 SQL 就能处理"只改一个字段"的情况。

## 可能出错的情况
| 情况 | 怎么办 |
| --- | --- |
| 这一项不存在 | 404，`code=CART_ITEM_NOT_FOUND` |
| 数量不合法 | 400，`code=INVALID_QUANTITY` |
| 配送方式无效 | 400，`code=INVALID_DELIVERY_OPTION` |

## 会用到哪些表
`cart_item`、`delivery_option`

## 名词解释 / 提醒
- **PUT**：用来"修改已有数据"的请求方式。
- **提醒**：现在用 `productId` 来定位购物车项。以后如果一个商品能同时加多个型号进车，就得改用 `cart_item.id` 来定位（因为同一个 productId 会有好几行）。
