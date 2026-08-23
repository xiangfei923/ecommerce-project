# 02. 查询商品详情

`GET /api/products/{id}`

## 一句话说明
根据商品 id，查出**这一个**商品的详细信息，还要带上它的所有**型号**（不同型号价格不一样）。

## 什么时候会用到
用户在列表页点了某个商品，进入**商品详情页** `/products/某个id`。

## 前端会传什么给你
就一个东西：商品 id，写在网址路径里。

| 参数 | 意思 | 例子 |
| --- | --- | --- |
| `id` | 商品 id（在路径里，不是 `?` 后面） | `3ebe75dc-...` |

例子：`GET /api/products/3ebe75dc-64d2-4137-8860-1f5a963e534b`

## 你要返回什么（响应，状态码 200）
```json
{
  "id": "3ebe75dc-64d2-4137-8860-1f5a963e534b",
  "name": "2 Piece White Dinner Plate Set",
  "image": "images/products/elegant-white-dinner-plate-set.jpg",
  "rating": { "stars": 4, "count": 37 },
  "priceCents": 2067,
  "keywords": ["plates", "kitchen", "dining"],
  "variants": [
    { "id": "v1-uuid", "name": "Standard", "priceCents": 2067 },
    { "id": "v2-uuid", "name": "Deluxe",   "priceCents": 2480 },
    { "id": "v3-uuid", "name": "Premium",  "priceCents": 3101 }
  ]
}
```

| 字段 | 意思 |
| --- | --- |
| `priceCents` | 商品默认价格（没选型号时用的价） |
| `variants` | 型号列表，一个商品有好几个型号，**每个型号价格不同** |
| `variants[].priceCents` | 这个型号的实际价格 |

## 后端要做的事（业务规则）
1. 拿 id 去 `product` 表查商品，查不到就返回 404（找不到）。
2. 再去 `product_variant` 表查这个商品的所有型号，按 `sort_order` 排好序。
3. 如果这个商品没有型号，`variants` 给个空数组 `[]` 就行。
4. 前端默认会选中第一个型号，用户切换型号时价格跟着变。

## SQL 怎么写
```sql
-- 查商品本身
SELECT id, name, image, rating_stars, rating_count, base_price_cents
FROM product WHERE id = :id;

-- 查这个商品的所有型号（价格不同）
SELECT id, name, price_cents
FROM product_variant
WHERE product_id = :id
ORDER BY sort_order;

-- 查这个商品的标签
SELECT k.name
FROM keyword k JOIN product_keyword pk ON pk.keyword_id = k.id
WHERE pk.product_id = :id;
```

## 可能出错的情况
| 情况 | 怎么办 |
| --- | --- |
| 商品不存在 | 返回 404，`code=PRODUCT_NOT_FOUND` |
| id 格式不对 | 返回 400 |
| 商品没有型号 | 不报错，`variants` 给 `[]` |

## 会用到哪些表
`product`、`product_variant`（型号）、`product_keyword`、`keyword`

## 备注
以前前端是自己在代码里假造型号价格的（`src/data/productVariants.ts`）。有了这个接口的 `variants` 后，就可以把那段假数据删掉，改用真实的型号了。
