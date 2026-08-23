# 后端接口开发设计文档（Ecommerce）

> 目标读者：后端开发（Spring Boot + MySQL）、前端开发、测试
> 技术栈：Spring Boot 3 / JDK 17+ / Spring Web / Spring Data JPA / MySQL 8
> 数据库：`ecommerce`（表结构见 `database/schema.sql`，测试数据见 `database/seed-data.sql`）
> 本文按**页面维度**组织接口，给出：页面需求 → 接口清单 → 请求/响应 → 关键 SQL → 说明。

---

## 1. 通用约定

### 1.1 基础
- 统一前缀：`/api`
- 传输格式：`application/json; charset=utf-8`
- 金额：一律用「分」（整数 `*Cents`），前端负责除以 100 显示
- 时间：对外统一用**毫秒时间戳**（`*Ms`，long），与现有前端字段（`orderTimeMs`、`estimatedDeliveryTimeMs`）保持一致
- 主键：`product` / `product_variant` / `orders` 用 UUID(CHAR(36))；明细/关联表用自增

### 1.2 响应风格
为**最小化前端改动**，沿用现有裸 JSON 风格（列表直接返回数组，详情直接返回对象），不加统一 envelope。
分页接口例外，返回带元数据的对象（见 3.2）。

### 1.3 错误响应
```json
{ "error": "Product not found", "code": "PRODUCT_NOT_FOUND" }
```

| HTTP | 场景 |
| --- | --- |
| 200 | 查询成功 |
| 201 | 创建成功（加购、下单） |
| 204 | 删除成功，无返回体 |
| 400 | 参数校验失败 |
| 404 | 资源不存在 |
| 500 | 服务端异常 |

### 1.4 页面 ↔ 接口 总览

| 页面 | 路由 | 使用的接口 |
| --- | --- | --- |
| 首页 | `/` | `GET /api/products`（取少量做轮播） |
| 商品列表页 | `/products` | `GET /api/products`（分页/搜索/类别）、`GET /api/categories` |
| 商品详情页 | `/products/:id` | `GET /api/products/{id}`、`POST /api/cart-items` |
| 购物车/结算页 | `/checkout` | `GET /api/cart-items?expand=product`、`PUT/DELETE /api/cart-items/{id}`、`GET /api/delivery-options`、`GET /api/payment-summary`、`POST /api/orders` |
| 订单列表页 | `/orders` | `GET /api/orders?expand=products` |
| 物流追踪页 | `/tracking/:orderId` | `GET /api/orders/{orderId}?expand=products` |

---

## 2. 首页 HomePage（`/`）

### 页面需求
轮播图，取少量商品作为 banner，每张关联商品 id 可点击跳转详情。

### 接口
复用商品列表接口，前端只取前 N 条即可，无需专门接口。若希望后端可控推荐位，可加下面这个可选接口。

#### （可选）GET /api/products/featured
- 用途：返回首页轮播用的精选商品
- 请求：`?limit=5`
- 响应：
```json
[
  { "id": "e43638ce-...", "name": "...", "image": "images/products/xxx.jpg",
    "rating": { "stars": 4.5, "count": 87 }, "priceCents": 1090 }
]
```
- 关键 SQL（示例：按评分与销量取前 N）：
```sql
SELECT id, name, image, rating_stars, rating_count, base_price_cents
FROM product
ORDER BY rating_stars DESC, rating_count DESC
LIMIT :limit;
```
- 说明：MVP 阶段可不做，前端直接调 `GET /api/products` 截取。

---

## 3. 商品列表页 ProductsPage（`/products`）

### 页面需求
- 展示商品列表
- 关键字搜索（匹配名称或关键字）
- 类别下拉过滤（类别来自所有商品 keywords 去重）
- 搜索条件写入 URL，刷新回填
- 图片懒加载（纯前端，不涉及接口）

> 现状：前端做本地过滤。本设计给出**服务端分页 + 过滤**方案，建议逐步迁移，数据量大时前端过滤不可持续。

### 3.1 GET /api/categories
- 用途：类别下拉框选项（去重关键字）
- 响应：
```json
["apparel", "appliances", "bathroom", "kitchen", "shoes", "sports"]
```
- 关键 SQL：
```sql
SELECT k.name
FROM keyword k
JOIN product_keyword pk ON pk.keyword_id = k.id
GROUP BY k.name
ORDER BY k.name;
```
- 说明：`JOIN product_keyword` 保证只返回**有商品在用**的类别。

### 3.2 GET /api/products
- 用途：商品列表（支持搜索、类别、分页、排序）
- 请求参数：

| 参数 | 类型 | 必填 | 默认 | 说明 |
| --- | --- | --- | --- | --- |
| `search` | string | 否 | - | 关键字，匹配名称或 keywords |
| `category` | string | 否 | - | 类别（单个 keyword 精确匹配） |
| `page` | int | 否 | 1 | 页码，从 1 开始 |
| `pageSize` | int | 否 | 20 | 每页数量（上限 100） |
| `sort` | enum | 否 | `default` | `default`/`priceAsc`/`priceDesc`/`ratingDesc` |

- 响应（分页对象）：
```json
{
  "items": [
    { "id": "e43638ce-...", "name": "Black and Gray Athletic Cotton Socks - 6 Pairs",
      "image": "images/products/athletic-cotton-socks-6-pairs.jpg",
      "rating": { "stars": 4.5, "count": 87 },
      "priceCents": 1090,
      "keywords": ["socks", "sports", "apparel"] }
  ],
  "page": 1,
  "pageSize": 20,
  "total": 100,
  "totalPages": 5
}
```
- 关键 SQL（搜索 + 类别 + 分页）：
```sql
-- 数据页
SELECT DISTINCT p.id, p.name, p.image, p.rating_stars, p.rating_count, p.base_price_cents
FROM product p
LEFT JOIN product_keyword pk ON pk.product_id = p.id
LEFT JOIN keyword k          ON k.id = pk.keyword_id
WHERE (:search  IS NULL OR p.name LIKE CONCAT('%', :search, '%')
                        OR k.name  LIKE CONCAT('%', :search, '%'))
  AND (:category IS NULL OR EXISTS (
        SELECT 1 FROM product_keyword pk2
        JOIN keyword k2 ON k2.id = pk2.keyword_id
        WHERE pk2.product_id = p.id AND k2.name = :category))
ORDER BY p.created_at ASC          -- sort=default
LIMIT :pageSize OFFSET :offset;

-- 总数（用于 totalPages）
SELECT COUNT(DISTINCT p.id)
FROM product p
LEFT JOIN product_keyword pk ON pk.product_id = p.id
LEFT JOIN keyword k          ON k.id = pk.keyword_id
WHERE ( ... 同上 ... );
```
- 说明：
  - `rating` 在 Java 层由 `rating_stars` / `rating_count` 组装成嵌套对象，兼容前端 `ProductType`。
  - `keywords` 单独查一次（`WHERE product_id IN (...)`）再拼进每个商品，避免主查询笛卡尔积膨胀。
  - JPA 实现建议用 `Specification` 或 `@Query` + `Pageable`。
  - `sort` 映射：`priceAsc`→`ORDER BY base_price_cents ASC`，`ratingDesc`→`ORDER BY rating_stars DESC, rating_count DESC`。

---

## 4. 商品详情页 ProductDetailPage（`/products/:id`）

### 页面需求
- 展示单个商品详情
- 展示**型号（variant）**列表，选不同型号显示不同价格
- 加入购物车（带型号、数量）

### 4.1 GET /api/products/{id}
- 用途：单商品详情，含型号
- 响应：
```json
{
  "id": "3ebe75dc-...",
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
- 关键 SQL：
```sql
SELECT id, name, image, rating_stars, rating_count, base_price_cents
FROM product WHERE id = :id;

SELECT id, name, price_cents
FROM product_variant
WHERE product_id = :id
ORDER BY sort_order;

SELECT k.name
FROM keyword k JOIN product_keyword pk ON pk.keyword_id = k.id
WHERE pk.product_id = :id;
```
- 说明：找不到返回 404 `PRODUCT_NOT_FOUND`。可用 JPA 关联 `@OneToMany` 一次带出 variants。

### 4.2 POST /api/cart-items
- 用途：加入购物车（型号维度）
- 请求体：
```json
{ "productId": "3ebe75dc-...", "variantId": "v2-uuid", "quantity": 2 }
```
- 校验：`quantity` 1..10；`productId` 存在；`variantId` 若传必须属于该商品
- 响应：201，返回该购物车项
```json
{ "id": 12, "productId": "3ebe75dc-...", "variantId": "v2-uuid",
  "quantity": 2, "deliveryOptionId": "1" }
```
- 关键 SQL（同商品同型号则累加数量）：
```sql
-- 校验 variant 归属
SELECT COUNT(*) FROM product_variant WHERE id = :variantId AND product_id = :productId;

-- upsert：存在则加数量，否则插入
SELECT id, quantity FROM cart_item
WHERE product_id = :productId AND (variant_id <=> :variantId);

-- 存在
UPDATE cart_item SET quantity = LEAST(quantity + :quantity, 10) WHERE id = :id;
-- 不存在
INSERT INTO cart_item (product_id, variant_id, quantity, delivery_option_id)
VALUES (:productId, :variantId, :quantity, '1');
```
- 说明：
  - `<=>` 是 MySQL 的 NULL 安全等于，兼容 `variantId` 为空的情况。
  - 唯一键 `uk_cart_product_variant(product_id, variant_id)` 保证同商品同型号只有一行。
  - 默认 `delivery_option_id='1'`（免费配送），与旧后端行为一致。

---

## 5. 购物车 / 结算页 CheckoutPage（`/checkout`）

### 页面需求
- 展示购物车商品（含商品与型号信息、单价、数量）
- 修改配送方式、删除商品
- 展示配送选项、费用汇总
- 提交订单

### 5.1 GET /api/cart-items?expand=product
- 用途：购物车列表，`expand=product` 时带出商品与型号快照
- 响应：
```json
[
  { "productId": "3ebe75dc-...", "variantId": "v2-uuid", "quantity": 2,
    "deliveryOptionId": "1",
    "product": { "id": "3ebe75dc-...", "name": "2 Piece White Dinner Plate Set",
                 "image": "images/products/elegant-white-dinner-plate-set.jpg" },
    "variant": { "id": "v2-uuid", "name": "Deluxe", "priceCents": 2480 } }
]
```
- 关键 SQL：
```sql
SELECT c.product_id, c.variant_id, c.quantity, c.delivery_option_id
FROM cart_item c
ORDER BY c.created_at ASC;
-- expand 时按 product_id / variant_id 批量查 product、product_variant 组装
```
- 说明：`variant.priceCents` 是购物车该行的**实际单价来源**，解决了「详情页价格与购物车对不上」。无 variant 时回退 `product.base_price_cents`。

### 5.2 PUT /api/cart-items/{productId}
- 用途：修改数量或配送方式
- 请求体（二者可选其一或都传）：
```json
{ "quantity": 3, "deliveryOptionId": "2" }
```
- 关键 SQL：
```sql
UPDATE cart_item
SET quantity = COALESCE(:quantity, quantity),
    delivery_option_id = COALESCE(:deliveryOptionId, delivery_option_id)
WHERE product_id = :productId;
```
- 说明：现有前端按 `productId` 定位；若将来同商品多型号并存，建议改用 `cart_item.id` 作为路径参数。**（迁移注意点）**

### 5.3 DELETE /api/cart-items/{productId}
- 用途：删除购物车项，返回 204
- 关键 SQL：
```sql
DELETE FROM cart_item WHERE product_id = :productId;
```

### 5.4 GET /api/delivery-options?expand=estimatedDeliveryTime
- 用途：配送方式列表
- 响应：
```json
[ { "id": "1", "deliveryDays": 7, "priceCents": 0,   "estimatedDeliveryTimeMs": 1690000000000 },
  { "id": "2", "deliveryDays": 3, "priceCents": 499, "estimatedDeliveryTimeMs": 1689000000000 },
  { "id": "3", "deliveryDays": 1, "priceCents": 999, "estimatedDeliveryTimeMs": 1688000000000 } ]
```
- 关键 SQL：
```sql
SELECT id, delivery_days, price_cents FROM delivery_option ORDER BY delivery_days;
```
- 说明：`estimatedDeliveryTimeMs` = `now + delivery_days`（跳过周末的逻辑可选），在 Java 层计算，不入库。

### 5.5 GET /api/payment-summary
- 用途：费用汇总（按型号价计算）
- 响应：
```json
{ "totalItems": 3, "productCostCents": 7040, "shippingCostCents": 499,
  "totalCostBeforeTaxCents": 7539, "taxCents": 754, "totalCostCents": 8293 }
```
- 关键 SQL：
```sql
SELECT
  SUM(c.quantity) AS total_items,
  SUM(c.quantity * COALESCE(v.price_cents, p.base_price_cents)) AS product_cost_cents,
  SUM(d.price_cents) AS shipping_cost_cents
FROM cart_item c
JOIN product p             ON p.id = c.product_id
LEFT JOIN product_variant v ON v.id = c.variant_id
JOIN delivery_option d      ON d.id = c.delivery_option_id;
```
- 说明：税 = `round(totalBeforeTax * 0.1)`，在 Java 层算。**单价用 `COALESCE(v.price_cents, p.base_price_cents)` 是本次修复的关键点。**

### 5.6 POST /api/orders
- 用途：下单（购物车 → 订单，做价格快照，清空购物车）
- 请求体：空
- 响应：201，返回新订单（结构同订单详情）
- 关键 SQL（一个事务内）：
```sql
-- 1) 计算总额（同 5.5 的 product+shipping+tax）
-- 2) 建订单
INSERT INTO orders (id, order_time, total_cost_cents)
VALUES (UUID(), NOW(3), :totalCostCents);

-- 3) 购物车逐项快照进 order_item（名称/图片/型号/单价 全部拷贝）
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

-- 4) 清空购物车
DELETE FROM cart_item;
```
- 说明：**必须放在同一事务**（`@Transactional`）。快照保证订单金额不随后续商品改价而变。

---

## 6. 订单列表页 OrdersPage（`/orders`）

### 页面需求
展示历史订单，每个订单含下单时间、总额、商品清单（图片/名称/数量/预计送达），可跳物流追踪。

### 6.1 GET /api/orders?expand=products
- 响应：
```json
[
  { "id": "order-uuid", "orderTimeMs": 1690000000000, "totalCostCents": 8293,
    "products": [
      { "productId": "3ebe75dc-...", "variantId": "v2-uuid", "quantity": 2,
        "estimatedDeliveryTimeMs": 1690600000000,
        "product": { "id": "3ebe75dc-...", "name": "2 Piece White Dinner Plate Set",
                     "image": "images/products/elegant-white-dinner-plate-set.jpg" },
        "variantName": "Deluxe", "unitPriceCents": 2480 } ] }
]
```
- 关键 SQL：
```sql
SELECT id, order_time, total_cost_cents FROM orders ORDER BY order_time DESC;

SELECT order_id, product_id, variant_id, product_name, product_image,
       variant_name, unit_price_cents, quantity, estimated_delivery_at
FROM order_item
WHERE order_id IN (:orderIds);
```
- 说明：商品信息**直接取 order_item 的快照字段**，不再关联 product 表（因为下单时已固化）。`estimatedDeliveryTimeMs` = `estimated_delivery_at` 转毫秒。

---

## 7. 物流追踪页 TrackingPage（`/tracking/:orderId`）

### 页面需求
根据 orderId 展示单个订单的追踪信息（送达时间、进度状态）。进度状态前端按送达时间计算。

### 7.1 GET /api/orders/{orderId}?expand=products
- 响应：单个订单对象（结构同 6.1 的元素）
- 关键 SQL：
```sql
SELECT id, order_time, total_cost_cents FROM orders WHERE id = :orderId;

SELECT product_id, variant_id, product_name, product_image, variant_name,
       unit_price_cents, quantity, estimated_delivery_at
FROM order_item WHERE order_id = :orderId;
```
- 说明：找不到返回 404。进度（Preparing/Shipped/Delivered）由前端按 `estimatedDeliveryTimeMs` 与当前时间推算，后端不需返回状态。

---

## 8. 接口汇总

| # | Method | Path | 用途 | 页面 |
| --- | --- | --- | --- | --- |
| 1 | GET | `/api/products` | 商品列表（搜索/类别/分页） | 首页、列表页 |
| 2 | GET | `/api/products/{id}` | 商品详情 + 型号 | 详情页 |
| 3 | GET | `/api/categories` | 类别下拉选项 | 列表页 |
| 4 | GET | `/api/products/featured` | 首页轮播（可选） | 首页 |
| 5 | GET | `/api/cart-items` | 购物车列表（expand=product） | 结算页 |
| 6 | POST | `/api/cart-items` | 加购（带型号） | 详情页 |
| 7 | PUT | `/api/cart-items/{productId}` | 改数量/配送 | 结算页 |
| 8 | DELETE | `/api/cart-items/{productId}` | 删除购物车项 | 结算页 |
| 9 | GET | `/api/delivery-options` | 配送方式 | 结算页 |
| 10 | GET | `/api/payment-summary` | 费用汇总（型号价） | 结算页 |
| 11 | POST | `/api/orders` | 下单（快照+清空车） | 结算页 |
| 12 | GET | `/api/orders` | 订单列表（expand=products） | 订单页 |
| 13 | GET | `/api/orders/{orderId}` | 订单详情/追踪 | 追踪页 |

---

## 9. 迁移注意点（前端需配合）

1. **列表分页**：`GET /api/products` 从返回数组改为返回 `{ items, total, ... }`，前端 `productsApi.ts` 与 `ProductsPage` 需适配；搜索/类别过滤从前端本地过滤改为传参给后端。
2. **详情页型号**：删除前端 mock `src/data/productVariants.ts`，改用接口返回的 `variants`。
3. **加购带型号**：`cartApi.addCartItem` 增加 `variantId` 参数；`Product`/详情页传 `variantId`。
4. **价格展示**：购物车 `OrderSummary` 单价改用 `variant.priceCents`（无型号回退 `product.priceCents`）。
5. **购物车定位**：`PUT/DELETE` 目前用 `productId`，如需支持同商品多型号共存，建议后续改为 `cart_item.id`。

---

## 10. 后续（本文未覆盖，建议规划）

- 用户体系与鉴权（当前所有数据不区分用户，购物车/订单是全局的）
- 库存与并发下单
- 订单状态机（当前状态由前端按时间推算，未持久化）
- 接口限流、日志与统一异常处理（`@RestControllerAdvice`）
