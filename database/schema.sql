-- =============================================================
-- Ecommerce 数据库表结构 (MySQL 8.0+)
-- 约定：
--   1) 金额一律用「分」存 INT，避免浮点误差
--   2) 主表主键用 UUID(CHAR(36))，兼容前端 URL 里的 id
--   3) 明细/关联表主键用 BIGINT AUTO_INCREMENT
--   4) 引擎 InnoDB + utf8mb4
-- =============================================================

SET NAMES utf8mb4;

-- 若重复执行本脚本，按依赖关系倒序删表
DROP TABLE IF EXISTS order_item;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS cart_item;
DROP TABLE IF EXISTS product_keyword;
DROP TABLE IF EXISTS keyword;
DROP TABLE IF EXISTS product_variant;
DROP TABLE IF EXISTS delivery_option;
DROP TABLE IF EXISTS product;

-- -------------------------------------------------------------
-- 商品
-- -------------------------------------------------------------
CREATE TABLE product (
  id               CHAR(36)     NOT NULL DEFAULT (UUID()),
  name             VARCHAR(255) NOT NULL,
  image            VARCHAR(500) NOT NULL,
  rating_stars     DECIMAL(2,1) NOT NULL DEFAULT 0.0,   -- 例如 4.5
  rating_count     INT          NOT NULL DEFAULT 0,
  base_price_cents INT          NOT NULL,               -- 列表页展示价 / 默认价
  created_at       DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at       DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
                                ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -------------------------------------------------------------
-- 商品型号（不同型号价格不同 —— 修复「详情页价格与购物车对不上」的核心）
-- -------------------------------------------------------------
CREATE TABLE product_variant (
  id          CHAR(36)     NOT NULL DEFAULT (UUID()),
  product_id  CHAR(36)     NOT NULL,
  name        VARCHAR(100) NOT NULL,                    -- Standard / Deluxe / Premium
  price_cents INT          NOT NULL,                    -- 该型号真实价格
  sort_order  INT          NOT NULL DEFAULT 0,
  created_at  DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at  DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
                           ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY uk_variant_product_name (product_id, name),
  CONSTRAINT fk_variant_product FOREIGN KEY (product_id)
    REFERENCES product (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -------------------------------------------------------------
-- 关键字 / 类别（规范化，供列表页类别下拉去重）
-- -------------------------------------------------------------
CREATE TABLE keyword (
  id   BIGINT       NOT NULL AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_keyword_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 商品-关键字 多对多关联表
CREATE TABLE product_keyword (
  product_id CHAR(36) NOT NULL,
  keyword_id BIGINT   NOT NULL,
  PRIMARY KEY (product_id, keyword_id),
  KEY idx_pk_keyword (keyword_id),
  CONSTRAINT fk_pk_product FOREIGN KEY (product_id)
    REFERENCES product (id) ON DELETE CASCADE,
  CONSTRAINT fk_pk_keyword FOREIGN KEY (keyword_id)
    REFERENCES keyword (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -------------------------------------------------------------
-- 配送方式
-- estimatedDeliveryTimeMs 不入库：查询时用 now + delivery_days 实时计算
-- -------------------------------------------------------------
CREATE TABLE delivery_option (
  id            VARCHAR(10) NOT NULL,   -- 沿用现有 "1"/"2"/"3"
  delivery_days INT         NOT NULL,
  price_cents   INT         NOT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -------------------------------------------------------------
-- 购物车项（引用具体型号）
-- 唯一键 (product_id, variant_id)：同商品同型号只占一行，数量累加
-- -------------------------------------------------------------
CREATE TABLE cart_item (
  id                 BIGINT      NOT NULL AUTO_INCREMENT,
  product_id         CHAR(36)    NOT NULL,
  variant_id         CHAR(36)        NULL,   -- 选中的型号
  quantity           INT         NOT NULL,
  delivery_option_id VARCHAR(10) NOT NULL,
  created_at         DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at         DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
                                 ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY uk_cart_product_variant (product_id, variant_id),
  KEY idx_cart_variant (variant_id),
  KEY idx_cart_delivery (delivery_option_id),
  CONSTRAINT fk_cart_product  FOREIGN KEY (product_id)
    REFERENCES product (id),
  CONSTRAINT fk_cart_variant  FOREIGN KEY (variant_id)
    REFERENCES product_variant (id),
  CONSTRAINT fk_cart_delivery FOREIGN KEY (delivery_option_id)
    REFERENCES delivery_option (id),
  CONSTRAINT ck_cart_quantity CHECK (quantity BETWEEN 1 AND 10)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -------------------------------------------------------------
-- 订单
-- -------------------------------------------------------------
CREATE TABLE orders (
  id               CHAR(36)    NOT NULL DEFAULT (UUID()),
  order_time       DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  total_cost_cents INT         NOT NULL,
  created_at       DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at       DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
                               ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -------------------------------------------------------------
-- 订单项（快照下单时的价格与商品信息，历史金额不随商品改价而变）
-- -------------------------------------------------------------
CREATE TABLE order_item (
  id                    BIGINT       NOT NULL AUTO_INCREMENT,
  order_id              CHAR(36)     NOT NULL,
  product_id            CHAR(36)     NOT NULL,
  variant_id            CHAR(36)         NULL,
  product_name          VARCHAR(255) NOT NULL,   -- 快照
  product_image         VARCHAR(500) NOT NULL,   -- 快照
  variant_name          VARCHAR(100)     NULL,   -- 快照
  unit_price_cents      INT          NOT NULL,   -- 下单时单价快照（核心）
  quantity              INT          NOT NULL,
  delivery_option_id    VARCHAR(10)      NULL,
  estimated_delivery_at DATETIME(3)  NOT NULL,   -- 下单时算好的预计送达时间
  PRIMARY KEY (id),
  KEY idx_order_item_order (order_id),
  KEY idx_order_item_product (product_id),
  CONSTRAINT fk_oi_order   FOREIGN KEY (order_id)
    REFERENCES orders (id) ON DELETE CASCADE,
  CONSTRAINT fk_oi_product FOREIGN KEY (product_id)
    REFERENCES product (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =============================================================
-- 参考数据：配送方式（固定基础数据，可按需调整）
-- =============================================================
INSERT INTO delivery_option (id, delivery_days, price_cents) VALUES
  ('1', 7,  0),
  ('2', 3,  499),
  ('3', 1,  999);
