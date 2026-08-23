# 后端接口设计（新手简化版）

> 这份文档是给刚入门的同学看的。目标：**用最少的概念**讲清楚"每个页面点一下，后端发生了什么，SQL 大概怎么写"。
> 完整严谨版见 `backend-api-design.md`，本文只讲主干、省略细节。

---

## 1. 先看大局：整个网站在干嘛

这是一个购物网站，用户会经历这样一条路：

```
逛首页  →  看商品列表  →  点进某个商品看详情  →  加入购物车  →  去结算  →  下单  →  看订单/查物流
```

后端要做的事，本质就是**把数据存进 MySQL、再查出来给前端**。一共 8 张表，记住这几张就够理解全局了：

| 表 | 存什么 | 一句话 |
| --- | --- | --- |
| `product` | 商品 | 名字、图片、价格、评分 |
| `product_variant` | 商品型号 | 同一个商品的不同款式，价格不同（Standard/Deluxe/Premium） |
| `keyword` + `product_keyword` | 分类标签 | 商品属于哪些类别（kitchen、shoes…） |
| `cart_item` | 购物车 | 用户加了哪些商品、买几个 |
| `delivery_option` | 配送方式 | 快递选项和运费 |
| `orders` + `order_item` | 订单 | 下单后生成的记录 |

---

## 2. 数据是怎么流动的

### 流程一：浏览商品（读数据）

```
前端                        后端                       数据库
 |  GET /api/products        |                          |
 |------------------------->  |  查 product 表           |
 |                           |------------------------> |
 |                           |  <----- 商品列表 -------- |
 |  <---- JSON 商品数组 ----- |                          |
 |  渲染到页面               |                          |
```

一句话：**前端要数据 → 后端查表 → 把结果拼成 JSON 返回**。浏览类接口都是这个套路。

### 流程二：加入购物车（写数据）

```
用户在详情页点"Add to Cart"
   → 前端 POST /api/cart-items，带上 {商品id, 型号id, 数量}
   → 后端往 cart_item 表插入一行（或已存在就把数量加上去）
   → 返回成功
```

### 流程三：下单（把购物车变成订单）

这是最"重"的一步，后端要在**一次操作里**做完 4 件事：

```
1. 算总价（商品价 × 数量 + 运费 + 税）
2. 往 orders 表插一条订单
3. 把购物车每一项"拍照"存进 order_item（连价格、名字一起存下来）
4. 清空购物车（删掉 cart_item）
```

> **为什么要"拍照"？** 因为商品以后可能涨价，但你**历史订单的金额不能跟着变**。所以下单时把当时的价格、名字抄一份存进 `order_item`，以后查订单就看这份抄件，不再看商品表。

---

## 3. 各个接口 + 简单 SQL

下面按页面来。SQL 用 `?` 代表前端传进来的参数。

### 首页 `/`
只需要拿几个商品做轮播，直接用商品列表接口取前几条。

---

### 商品列表页 `/products`

**接口 1：拿分类下拉框的选项**
`GET /api/categories`
```sql
-- 查出所有用到的分类名字，去重
SELECT DISTINCT k.name
FROM keyword k
JOIN product_keyword pk ON pk.keyword_id = k.id
ORDER BY k.name;
```

**接口 2：查商品列表（可搜索、可按分类筛）**
`GET /api/products?search=xxx&category=kitchen`
```sql
-- 最简单的版本：按名字搜
SELECT * FROM product
WHERE name LIKE CONCAT('%', ?, '%');

-- 按分类筛：找出属于某个分类的商品
SELECT p.*
FROM product p
JOIN product_keyword pk ON pk.product_id = p.id
JOIN keyword k          ON k.id = pk.keyword_id
WHERE k.name = ?;
```
> 新手先理解这两条。真实项目里搜索、分类、分页会合在一条 SQL 里，见完整版。

---

### 商品详情页 `/products/:id`

**接口 1：查一个商品的详情**
`GET /api/products/{id}`
```sql
-- 商品本身
SELECT * FROM product WHERE id = ?;

-- 这个商品的所有型号（价格不同）
SELECT id, name, price_cents
FROM product_variant
WHERE product_id = ?
ORDER BY sort_order;
```

**接口 2：加入购物车**
`POST /api/cart-items`  请求体：`{ productId, variantId, quantity }`
```sql
-- 往购物车插一行
INSERT INTO cart_item (product_id, variant_id, quantity, delivery_option_id)
VALUES (?, ?, ?, '1');
```
> `'1'` 是默认配送方式（免费快递）。如果这个商品+型号已经在购物车里了，就改成把数量加上去。

---

### 结算页 `/checkout`

**接口 1：看购物车里有什么**
`GET /api/cart-items`
```sql
SELECT * FROM cart_item;
-- 再根据里面的 product_id / variant_id 查出商品名、图片、价格拼进去
```

**接口 2：改数量或配送方式**
`PUT /api/cart-items/{productId}`
```sql
UPDATE cart_item
SET quantity = ?, delivery_option_id = ?
WHERE product_id = ?;
```

**接口 3：删除购物车里的一项**
`DELETE /api/cart-items/{productId}`
```sql
DELETE FROM cart_item WHERE product_id = ?;
```

**接口 4：查配送方式**
`GET /api/delivery-options`
```sql
SELECT * FROM delivery_option ORDER BY delivery_days;
```

**接口 5：算钱（费用汇总）**
`GET /api/payment-summary`
```sql
-- 把购物车每一项的 (单价 × 数量) 加起来，再加运费
SELECT
  SUM(c.quantity) AS total_items,
  SUM(c.quantity * COALESCE(v.price_cents, p.base_price_cents)) AS product_cost,
  SUM(d.price_cents) AS shipping_cost
FROM cart_item c
JOIN product p              ON p.id = c.product_id
LEFT JOIN product_variant v ON v.id = c.variant_id
JOIN delivery_option d      ON d.id = c.delivery_option_id;
-- 税 = 上面商品+运费 的 10%，在 Java 代码里算
```
> `COALESCE(v.price_cents, p.base_price_cents)` 意思是：**有型号价就用型号价，没有就用商品默认价**。这就是修好"价格对不上"的关键。

**接口 6：下单**
`POST /api/orders`
```sql
-- 1. 建订单
INSERT INTO orders (id, order_time, total_cost_cents)
VALUES (UUID(), NOW(3), ?);

-- 2. 把购物车"拍照"进订单明细
INSERT INTO order_item
  (order_id, product_id, variant_id, product_name, product_image,
   unit_price_cents, quantity, estimated_delivery_at)
SELECT ?, c.product_id, c.variant_id, p.name, p.image,
       COALESCE(v.price_cents, p.base_price_cents), c.quantity,
       DATE_ADD(NOW(3), INTERVAL d.delivery_days DAY)
FROM cart_item c
JOIN product p              ON p.id = c.product_id
LEFT JOIN product_variant v ON v.id = c.variant_id
JOIN delivery_option d      ON d.id = c.delivery_option_id;

-- 3. 清空购物车
DELETE FROM cart_item;
```
> 这 3 步要放在一个"事务"里（Spring 里加 `@Transactional`）：**要么全成功，要么全不做**，不能订单建了一半购物车没清。

---

### 订单列表页 `/orders`

`GET /api/orders`
```sql
-- 所有订单，最新的在前
SELECT * FROM orders ORDER BY order_time DESC;

-- 每个订单里的商品（直接读拍照下来的明细）
SELECT * FROM order_item WHERE order_id = ?;
```

---

### 物流追踪页 `/tracking/:orderId`

`GET /api/orders/{orderId}`
```sql
SELECT * FROM orders WHERE id = ?;
SELECT * FROM order_item WHERE order_id = ?;
```
> 送到没送到（进度状态）是前端用"预计送达时间"和"当前时间"比出来的，后端不用管。

---

## 4. 接口一览表

| 接口 | 干嘛的 | 读/写 |
| --- | --- | --- |
| `GET /api/products` | 商品列表 | 读 |
| `GET /api/products/{id}` | 商品详情 + 型号 | 读 |
| `GET /api/categories` | 分类下拉选项 | 读 |
| `GET /api/cart-items` | 看购物车 | 读 |
| `POST /api/cart-items` | 加入购物车 | 写 |
| `PUT /api/cart-items/{id}` | 改数量/配送 | 写 |
| `DELETE /api/cart-items/{id}` | 删购物车项 | 写 |
| `GET /api/delivery-options` | 配送方式 | 读 |
| `GET /api/payment-summary` | 算钱 | 读 |
| `POST /api/orders` | 下单 | 写 |
| `GET /api/orders` | 订单列表 | 读 |
| `GET /api/orders/{id}` | 订单详情/物流 | 读 |

---

## 5. 记住三句话

1. **读接口**：前端要 → 后端查表 → 拼 JSON 返回。
2. **写接口**：前端提交 → 后端 INSERT/UPDATE/DELETE。
3. **下单**：算钱 + 建订单 + 拍照明细 + 清购物车，四步一个事务。

看懂这份后，再去看 `backend-api-design.md` 了解分页、参数校验、错误码等工程细节。
