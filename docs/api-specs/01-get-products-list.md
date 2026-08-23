# 01. 查询商品列表

`GET /api/products`

## 一句话说明
把商品从数据库查出来给前端显示。可以按关键字搜、按类别筛、分页一页一页给。

## 什么时候会用到
- 用户打开**首页**（取前几个做轮播）
- 用户打开**商品列表页** `/products`
- 用户在列表页**输入搜索词**或**选了某个类别**

## 前端会传什么给你（都写在网址后面的 `?` 里，都可不传）

| 参数 | 意思 | 例子 |
| --- | --- | --- |
| `search` | 用户输入的搜索词，用来匹配商品名或关键字 | `plate` |
| `category` | 用户选的类别 | `kitchen` |
| `page` | 第几页，从 1 开始 | `1` |
| `pageSize` | 一页要几个，最多 100 | `20` |
| `sort` | 怎么排序 | `priceAsc`（价格从低到高） |

完整例子：`GET /api/products?search=plate&category=kitchen&page=1&pageSize=20`

## 你要返回什么（响应，状态码 200）
注意：不是直接返回一个数组，而是返回一个**带分页信息的对象**（因为前端要知道一共多少页）。

```json
{
  "items": [
    {
      "id": "3ebe75dc-64d2-4137-8860-1f5a963e534b",
      "name": "2 Piece White Dinner Plate Set",
      "image": "images/products/elegant-white-dinner-plate-set.jpg",
      "rating": { "stars": 4, "count": 37 },
      "priceCents": 2067,
      "keywords": ["plates", "kitchen", "dining"]
    }
  ],
  "page": 1,
  "pageSize": 20,
  "total": 100,
  "totalPages": 5
}
```

| 字段 | 意思 |
| --- | --- |
| `items` | 这一页的商品数组 |
| `priceCents` | 价格，单位是「分」（2067 = 20.67 元），前端自己除以 100 |
| `rating` | 评分，`stars` 是星级、`count` 是多少人评价 |
| `keywords` | 这个商品有哪些标签 |
| `total` | 一共有多少个商品（符合搜索条件的） |
| `totalPages` | 一共多少页 = `total ÷ pageSize` 向上取整 |

## 后端要做的事（业务规则）
1. 三个筛选条件（search、category）**用户可能传也可能不传**，不传就不筛。
2. `search` 要同时在**商品名**和**关键字**里找，不区分大小写。
3. `category` 是精确匹配某个标签。
4. 如果 `pageSize` 传超过 100，就当 100；`page` 小于 1 就当 1。
5. 数据库里评分是两列（stars、count），你要在代码里把它们拼成一个 `rating: { stars, count }` 对象再返回。

## SQL 怎么写（逐句看）
```sql
-- 查这一页的商品
SELECT DISTINCT p.id, p.name, p.image, p.rating_stars, p.rating_count, p.base_price_cents
FROM product p
LEFT JOIN product_keyword pk ON pk.product_id = p.id   -- 关联"商品-标签"表
LEFT JOIN keyword k          ON k.id = pk.keyword_id    -- 再关联"标签"表拿到标签名字
WHERE (:search  IS NULL OR p.name LIKE CONCAT('%', :search, '%')   -- 没传 search 就不筛
                        OR k.name  LIKE CONCAT('%', :search, '%'))
  AND (:category IS NULL OR EXISTS (      -- 没传 category 就不筛
        SELECT 1 FROM product_keyword pk2
        JOIN keyword k2 ON k2.id = pk2.keyword_id
        WHERE pk2.product_id = p.id AND k2.name = :category))
ORDER BY p.created_at ASC
LIMIT :pageSize OFFSET :offset;    -- 分页：跳过前面几条，取这一页

-- 再查一次总数，用来算一共多少页
SELECT COUNT(DISTINCT p.id)
FROM product p
LEFT JOIN product_keyword pk ON pk.product_id = p.id
LEFT JOIN keyword k          ON k.id = pk.keyword_id
WHERE ( /* 和上面一样的筛选条件 */ );
```

**排序怎么对应 `sort`**：
- `priceAsc` → `ORDER BY base_price_cents ASC`（价格低到高）
- `priceDesc` → 价格高到低
- `ratingDesc` → `ORDER BY rating_stars DESC, rating_count DESC`（评分高的在前）

## 可能出错的情况
| 情况 | 怎么办 |
| --- | --- |
| 没搜到任何商品 | 正常返回，`items` 给空数组 `[]`，`total` 给 0 |
| page 传了个非数字 | 返回 400，告诉前端参数错了 |
| category 是个不存在的类别 | 不报错，正常返回空列表 |

## 会用到哪些表
`product`（商品）、`product_keyword`（商品-标签关联）、`keyword`（标签）

## 名词解释（新手看这里）
- **LEFT JOIN（左连接）**：把两张表拼起来查。即使某商品没有标签，这条商品也**不会丢**，只是标签部分是空的。
- **DISTINCT**：去重。因为一个商品有多个标签，join 后会出现重复行，用它去掉重复。
- **OFFSET / LIMIT**：分页用。`LIMIT 20 OFFSET 40` = 跳过前 40 条、取 20 条（也就是第 3 页）。
- **`:xxx`**：代表前端传进来的参数（在 Java 里用参数绑定，别直接拼字符串，防 SQL 注入）。

## 备注
首页轮播直接用这个接口取前几个就行，不用单独做接口。
