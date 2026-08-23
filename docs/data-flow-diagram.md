# 数据流程图（新手版）

> 配合 `backend-api-design-simple.md` 看。用 Mermaid 画图。
> 在 VS Code 里装 **Markdown Preview Mermaid Support** 扩展，或直接在 GitHub 打开本文件即可看到图。

---

## 1. 三层结构：数据在哪里流

整个系统就三层，数据在它们之间来回跑：

```mermaid
flowchart LR
    U["用户<br/>(浏览器)"] -->|点击操作| F["前端 React<br/>页面"]
    F -->|"HTTP 请求<br/>/api/..."| B["后端 Spring Boot<br/>Controller / Service"]
    B -->|"SQL 查询/写入"| D[("MySQL<br/>数据库")]
    D -->|"返回数据行"| B
    B -->|"返回 JSON"| F
    F -->|"渲染画面"| U
```

一句话：**用户点一下 → 前端发请求 → 后端执行 SQL → 数据库给数据 → 一路返回并显示**。

---

## 2. 用户旅程：每个页面用哪些接口、碰哪些表

```mermaid
flowchart TD
    Home["首页 /"] --> List["商品列表 /products"]
    List --> Detail["商品详情 /products/:id"]
    Detail --> Cart["加入购物车"]
    Cart --> Checkout["结算页 /checkout"]
    Checkout --> Order["下单"]
    Order --> Orders["订单列表 /orders"]
    Orders --> Track["物流追踪 /tracking/:id"]

    List -. "GET /api/products<br/>GET /api/categories" .-> TP[("product<br/>keyword")]
    Detail -. "GET /api/products/{id}" .-> TV[("product<br/>product_variant")]
    Cart -. "POST /api/cart-items" .-> TC[("cart_item")]
    Checkout -. "GET /api/payment-summary" .-> TC
    Order -. "POST /api/orders" .-> TO[("orders<br/>order_item")]
    Orders -. "GET /api/orders" .-> TO
    Track -. "GET /api/orders/{id}" .-> TO
```

实线 = 用户走的路；虚线 = 该页面调的接口和碰的表。

---

## 3. 读数据：以"看商品列表"为例

最常见的流程，浏览类接口都长这样：

```mermaid
sequenceDiagram
    participant U as 用户
    participant F as 前端
    participant B as 后端
    participant D as MySQL

    U->>F: 打开 /products
    F->>B: GET /api/products
    B->>D: SELECT * FROM product ...
    D-->>B: 商品数据行
    B-->>F: JSON 商品数组
    F-->>U: 渲染商品卡片
```

---

## 4. 写数据：以"加入购物车"为例

```mermaid
sequenceDiagram
    participant U as 用户
    participant F as 前端
    participant B as 后端
    participant D as MySQL

    U->>F: 详情页点 "Add to Cart"
    F->>B: POST /api/cart-items<br/>{productId, variantId, quantity}
    B->>D: INSERT INTO cart_item ...<br/>(已存在则 UPDATE 加数量)
    D-->>B: 写入成功
    B-->>F: 201 返回该购物车项
    F-->>U: 顶部购物车数字 +1
```

---

## 5. 下单：四步一个事务（最重要）

下单要在**一个事务**里做完 4 件事，任何一步失败就全部回滚：

```mermaid
flowchart TD
    Start(["用户点 Place Order<br/>POST /api/orders"]) --> T1

    subgraph TX["一个数据库事务 @Transactional"]
        T1["① 算总价<br/>商品价×数量 + 运费 + 税"] --> T2
        T2["② 建订单<br/>INSERT INTO orders"] --> T3
        T3["③ 拍照明细<br/>购物车每项抄进 order_item<br/>(连价格、名字一起存)"] --> T4
        T4["④ 清空购物车<br/>DELETE FROM cart_item"]
    end

    T4 --> Done(["返回新订单<br/>购物车已清空"])

    T1 -.失败.-> RB(["回滚：什么都没改"])
    T2 -.失败.-> RB
    T3 -.失败.-> RB
    T4 -.失败.-> RB
```

> **为什么第③步要"拍照"？** 商品以后可能涨价，但历史订单金额不能变。
> 所以下单时把当时的价格/名字抄一份存进 `order_item`，以后查订单只看这份抄件。

---

## 6. 表之间的关系（简版）

```mermaid
erDiagram
    product ||--o{ product_variant : "一个商品有多个型号"
    product }o--o{ keyword         : "多对多分类"
    product ||--o{ cart_item       : "被加进购物车"
    orders  ||--o{ order_item      : "一个订单多个明细"

    product {
        string id
        string name
        int base_price_cents
    }
    product_variant {
        string id
        string name
        int price_cents
    }
    cart_item {
        int id
        string product_id
        string variant_id
        int quantity
    }
    orders {
        string id
        int total_cost_cents
    }
    order_item {
        int id
        string product_name "快照"
        int unit_price_cents "快照"
        int quantity
    }
```

---

## 7. 一图记住全局

```mermaid
flowchart LR
    subgraph 读["读数据（看）"]
        R1["列表/详情/订单"] --> R2["SELECT 查表"] --> R3["返回 JSON"]
    end
    subgraph 写["写数据（改）"]
        W1["加购/改数量/删除"] --> W2["INSERT/UPDATE/DELETE"]
    end
    subgraph 单["下单（特殊）"]
        O1["算钱→建单→拍照→清车"] --> O2["一个事务"]
    end
```

看懂这几张图，就掌握了整个后端的数据流。细节（分页、校验、错误码）再看 `backend-api-design.md`。
