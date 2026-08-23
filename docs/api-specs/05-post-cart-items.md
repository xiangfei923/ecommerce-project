# 05. 加入购物车

`POST /api/cart-items`

## 一句话说明
把用户选的商品（含型号、数量）加到购物车里。

## 什么时候会用到
用户在**商品详情页**选好型号和数量，点了 "Add to Cart"。

## 前端会传什么给你（放在请求体 Body 里）
```json
{ "productId": "3ebe75dc-...", "variantId": "v2-uuid", "quantity": 2 }
```

| 字段 | 意思 | 必填 |
| --- | --- | --- |
| `productId` | 加哪个商品 | 是 |
| `variantId` | 选的哪个型号 | 否（可以不选型号） |
| `quantity` | 买几个（1~10） | 是 |

## 你要返回什么（响应，状态码 201）
201 表示"创建成功"。返回这条购物车记录：
```json
{ "id": 12, "productId": "3ebe75dc-...", "variantId": "v2-uuid",
  "quantity": 2, "deliveryOptionId": "1" }
```

## 后端要做的事（业务规则）
1. 先检查 `productId` 是不是真的存在，不存在就返回 400。
2. 如果传了 `variantId`，要检查这个型号**确实属于这个商品**，不然就是乱传，返回 400。
3. `quantity` 必须是 1 到 10 的整数。
4. **重点**：如果购物车里已经有"同一个商品 + 同一个型号"了，就**把数量加上去**，不要新增一行。
5. 新加的行，默认配送方式给 `'1'`（免费配送）。

## SQL 怎么写
```sql
-- 检查型号是不是这个商品的
SELECT COUNT(*) FROM product_variant WHERE id = :variantId AND product_id = :productId;

-- 看购物车里有没有"同商品同型号"（<=> 能正确处理型号为空的情况）
SELECT id, quantity FROM cart_item
WHERE product_id = :productId AND (variant_id <=> :variantId);

-- 已经有了：数量加上去，最多不超过 10
UPDATE cart_item SET quantity = LEAST(quantity + :quantity, 10) WHERE id = :id;

-- 还没有：插一条新的
INSERT INTO cart_item (product_id, variant_id, quantity, delivery_option_id)
VALUES (:productId, :variantId, :quantity, '1');
```

## 可能出错的情况
| 情况 | 怎么办 |
| --- | --- |
| 商品不存在 | 400，`code=PRODUCT_NOT_FOUND` |
| 型号不属于这个商品 | 400，`code=VARIANT_MISMATCH` |
| 数量不在 1~10 | 400，`code=INVALID_QUANTITY` |
| 加起来超过 10 | 取 10（`LEAST` 就是取较小值） |

## 会用到哪些表
`cart_item`、`product`、`product_variant`

## 名词解释（新手看这里）
- **POST**：用来"新增/提交数据"的请求方式（GET 是查询，POST 是提交）。
- **`<=>`**：MySQL 里的"NULL 安全等于"。普通的 `=` 遇到 NULL 会出问题，`<=>` 能正确判断"两个都是空"也算相等，正好用于没选型号（variantId 为 NULL）的情况。
- **`LEAST(a, b)`**：取两个里较小的那个。这里用来防止数量加超过 10。
