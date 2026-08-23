# Ecommerce 数据库设计图 (ER Diagram)

下面是 Mermaid 版的实体关系图。在 VS Code 里装 **Markdown Preview Mermaid Support** 扩展，
或直接在 GitHub 上打开本文件，都能看到带连线的关系图。

```mermaid
erDiagram
    product ||--o{ product_variant  : "有多个型号"
    product ||--o{ product_keyword  : ""
    keyword ||--o{ product_keyword  : ""
    product ||--o{ cart_item        : ""
    product_variant ||--o{ cart_item : "选中型号"
    delivery_option ||--o{ cart_item : ""
    orders  ||--o{ order_item        : "包含多个订单项"
    product ||--o{ order_item        : ""

    product {
        char36  id PK
        varchar name
        varchar image
        decimal rating_stars
        int     rating_count
        int     base_price_cents
        datetime created_at
        datetime updated_at
    }

    product_variant {
        char36  id PK
        char36  product_id FK
        varchar name
        int     price_cents
        int     sort_order
    }

    keyword {
        bigint  id PK
        varchar name UK
    }

    product_keyword {
        char36  product_id PK,FK
        bigint  keyword_id PK,FK
    }

    delivery_option {
        varchar id PK
        int     delivery_days
        int     price_cents
    }

    cart_item {
        bigint  id PK
        char36  product_id FK
        char36  variant_id FK
        int     quantity
        varchar delivery_option_id FK
    }

    orders {
        char36  id PK
        datetime order_time
        int     total_cost_cents
    }

    order_item {
        bigint  id PK
        char36  order_id FK
        char36  product_id FK
        char36  variant_id
        varchar product_name
        varchar product_image
        varchar variant_name
        int     unit_price_cents
        int     quantity
        datetime estimated_delivery_at
    }
```

## 关系说明

| 关系 | 基数 | 说明 |
| --- | --- | --- |
| product → product_variant | 1 : N | 一个商品有多个型号，型号价格不同 |
| product ↔ keyword | N : N | 通过 product_keyword 关联，供类别筛选 |
| product → cart_item | 1 : N | 购物车项引用商品 |
| product_variant → cart_item | 1 : N | 购物车项引用选中的型号（决定价格） |
| delivery_option → cart_item | 1 : N | 购物车项的配送方式 |
| orders → order_item | 1 : N | 一个订单包含多个订单项 |
| product → order_item | 1 : N | 订单项引用商品（价格/名称已快照，不随改价变动） |
