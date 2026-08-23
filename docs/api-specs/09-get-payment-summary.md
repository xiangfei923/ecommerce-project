# 09. 查询费用汇总

`GET /api/payment-summary`

## 一句话说明
把购物车里的东西算总价：商品多少钱 + 运费 + 税 = 一共多少钱。

## 什么时候会用到
用户打开**结算页**，右边要显示费用明细。

## 前端会传什么给你
啥也不用传。

例子：`GET /api/payment-summary`

## 你要返回什么（响应，状态码 200）
```json
{
  "totalItems": 3,
  "productCostCents": 7040,
  "shippingCostCents": 499,
  "totalCostBeforeTaxCents": 7539,
  "taxCents": 754,
  "totalCostCents": 8293
}
```

| 字段 | 意思 | 怎么来的 |
| --- | --- | --- |
| `totalItems` | 一共几件商品 | 每项数量加起来 |
| `productCostCents` | 商品小计 | 每项(单价×数量)加起来 |
| `shippingCostCents` | 运费合计 | 每项的运费加起来 |
| `totalCostBeforeTaxCents` | 税前总额 | 商品小计 + 运费 |
| `taxCents` | 税 | 税前总额 × 10%，四舍五入 |
| `totalCostCents` | 最终总额 | 税前总额 + 税 |

## 后端要做的事（业务规则）
1. **单价怎么取**：有型号就用型号价，没型号就用商品默认价。（这一点最关键，看下面 SQL）
2. 税 = 税前总额 × 10%，四舍五入，在 Java 代码里算。
3. 购物车空的话，所有数字都是 0。

## SQL 怎么写
```sql
SELECT
  SUM(c.quantity) AS total_items,
  SUM(c.quantity * COALESCE(v.price_cents, p.base_price_cents)) AS product_cost_cents,
  SUM(d.price_cents) AS shipping_cost_cents
FROM cart_item c
JOIN product p              ON p.id = c.product_id
LEFT JOIN product_variant v ON v.id = c.variant_id   -- 可能没型号，用 LEFT JOIN
JOIN delivery_option d      ON d.id = c.delivery_option_id;
```

## 可能出错的情况
| 情况 | 怎么办 |
| --- | --- |
| 购物车是空的 | 所有字段返回 0 |

## 会用到哪些表
`cart_item`、`product`、`product_variant`、`delivery_option`

## 名词解释（新手重点看这里）
- **SUM(...)**：把某一列的值全加起来（求和）。
- **COALESCE(a, b)**：从左往右取**第一个不为空**的值。这里 `COALESCE(v.price_cents, p.base_price_cents)` 意思是：
  - 用户选了型号 → 型号价有值 → 用型号价；
  - 用户没选型号 → 型号价是空(NULL) → 退回去用商品默认价。
  - **这就是修好"详情页价格和购物车对不上"那个 bug 的关键写法。**
- **为什么用 LEFT JOIN 连型号表**：因为购物车项可能没有型号，用普通 JOIN 会把这些没型号的行弄丢，LEFT JOIN 能保留它们（型号字段为空，正好交给 COALESCE 兜底）。
