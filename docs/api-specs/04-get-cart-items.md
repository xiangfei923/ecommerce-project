# 04. 查看购物车

`GET /api/cart-items`

## 一句话说明
把购物车里现在有哪些东西查出来给前端显示。

## 什么时候会用到
- 用户打开**结算页** `/checkout`
- 加购、删除、改数量后，前端会重新调一次来刷新

## 前端会传什么给你

| 参数 | 意思 | 例子 |
| --- | --- | --- |
| `expand` | 传 `product` 时，顺便把商品名、图片、型号也一起带出来 | `product` |

例子：`GET /api/cart-items?expand=product`

## 你要返回什么（响应，状态码 200）
一个数组，每一项是购物车里的一行：

```json
[
  {
    "productId": "3ebe75dc-64d2-4137-8860-1f5a963e534b",
    "variantId": "v2-uuid",
    "quantity": 2,
    "deliveryOptionId": "1",
    "product": {
      "id": "3ebe75dc-64d2-4137-8860-1f5a963e534b",
      "name": "2 Piece White Dinner Plate Set",
      "image": "images/products/elegant-white-dinner-plate-set.jpg"
    },
    "variant": { "id": "v2-uuid", "name": "Deluxe", "priceCents": 2480 }
  }
]
```

| 字段 | 意思 |
| --- | --- |
| `productId` | 是哪个商品 |
| `variantId` | 选的哪个型号；没选型号就是 null |
| `quantity` | 买几个 |
| `deliveryOptionId` | 选的哪种配送 |
| `product` / `variant` | 只有传了 `expand=product` 才会有；商品和型号的详细信息 |
| `variant.priceCents` | 这一行商品的**实际单价**就看它 |

## 后端要做的事（业务规则）
1. 不带 `expand`：只返回购物车行本身（4 个 id/数量字段）。
2. 带 `expand=product`：再根据里面的 productId、variantId 去查商品和型号，拼进去。
3. 单价优先用型号价（`variant.priceCents`），没型号前端会用商品默认价。
4. 购物车空的话返回空数组 `[]`。

## SQL 怎么写
```sql
-- 先查购物车所有行
SELECT product_id, variant_id, quantity, delivery_option_id
FROM cart_item
ORDER BY created_at ASC;

-- 带 expand 时，把上面查到的 id 收集起来，一次性批量查商品和型号
SELECT id, name, image FROM product WHERE id IN (:productIds);
SELECT id, name, price_cents FROM product_variant WHERE id IN (:variantIds);
```
> 提示：别在循环里一个一个查商品（那样会查很多次很慢），把 id 收集起来用 `IN (...)` 一次查完。

## 可能出错的情况
| 情况 | 怎么办 |
| --- | --- |
| 购物车是空的 | 返回 `[]` |
| 某商品被删了 | 那一行的 `product` 给 null，前端会做判断 |

## 会用到哪些表
`cart_item`（购物车）、`product`、`product_variant`

## 名词解释 / 提醒
- **单用户**：现在整个网站只有**一个**购物车，所有人共用（因为还没做登录）。以后做了用户系统，这里要加"只查当前用户的购物车"。
- **expand**：一种常见做法，前端说"顺便把关联的详细信息也给我"，避免它再单独调好几个接口。
