# 08. 查询配送方式

`GET /api/delivery-options`

## 一句话说明
把可选的快递方式（免费/标准/加急）查出来给前端，每种有运费和大概哪天到。

## 什么时候会用到
用户打开**结算页**，每个购物车商品下面要列出"选择配送方式"。

## 前端会传什么给你

| 参数 | 意思 |
| --- | --- |
| `expand` | 传 `estimatedDeliveryTime` 时，顺便算出"预计哪天到"给它 |

例子：`GET /api/delivery-options?expand=estimatedDeliveryTime`

## 你要返回什么（响应，状态码 200）
```json
[
  { "id": "1", "deliveryDays": 7, "priceCents": 0,   "estimatedDeliveryTimeMs": 1690000000000 },
  { "id": "2", "deliveryDays": 3, "priceCents": 499, "estimatedDeliveryTimeMs": 1689000000000 },
  { "id": "3", "deliveryDays": 1, "priceCents": 999, "estimatedDeliveryTimeMs": 1688000000000 }
]
```

| 字段 | 意思 |
| --- | --- |
| `deliveryDays` | 要几天送到 |
| `priceCents` | 运费（分），0 就是免费 |
| `estimatedDeliveryTimeMs` | 预计送达时间；只有传 `expand` 才有 |

## 后端要做的事（业务规则）
1. 按送达天数从少到多排序。
2. `estimatedDeliveryTimeMs` **不存在数据库里**，是用"现在时间 + deliveryDays 天"当场算出来的。

## SQL 怎么写
```sql
SELECT id, delivery_days, price_cents
FROM delivery_option
ORDER BY delivery_days;
```
预计送达时间在 Java 代码里算：`现在时间 + deliveryDays 天`，再转成毫秒。

## 可能出错的情况
| 情况 | 怎么办 |
| --- | --- |
| 没有配送方式数据 | 返回 `[]`（正常情况下应该有初始数据） |

## 会用到哪些表
`delivery_option`

## 备注
配送方式的初始数据已经写在 `database/schema.sql` 最后面了（id 分别是 1、2、3）。
