// 生成 seed-data.sql：100 个商品 + 型号 + 关键字。
// 以原工程 mock(defaultProducts.js)为基础，不足 100 的部分复用已有图片派生。
// 用法：node database/generate-seed.mjs
import { randomUUID } from "crypto";
import { writeFileSync } from "fs";
import { pathToFileURL } from "url";

const BACKEND_PRODUCTS =
  "/Users/lishuangshuang/workspace/ecommerce-backend/defaultData/defaultProducts.js";

const { defaultProducts } = await import(pathToFileURL(BACKEND_PRODUCTS).href);

// 确定性随机，保证每次生成结果一致
function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(20260823);

const STAR_CHOICES = [3.5, 4, 4.5, 5];
const TARGET = 100;

// SQL 字符串转义
const q = (s) => `'${String(s).replace(/'/g, "''")}'`;

// 1) 组装 100 个商品
const products = [];
for (let i = 0; i < TARGET; i++) {
  const base = defaultProducts[i % defaultProducts.length];
  if (i < defaultProducts.length) {
    // 前 43 个：原样使用真实数据
    products.push({
      id: base.id,
      image: base.image,
      name: base.name,
      stars: base.rating.stars,
      count: base.rating.count,
      priceCents: base.priceCents,
      keywords: base.keywords,
    });
  } else {
    // 其余：复用已有图片派生新商品，价格/评分做确定性扰动
    const round = Math.floor(i / defaultProducts.length) + 1;
    const priceCents = Math.max(
      299,
      base.priceCents + Math.floor((rand() - 0.5) * 1000),
    );
    products.push({
      id: randomUUID(),
      image: base.image,
      name: `${base.name} (Edition ${round})`,
      stars: STAR_CHOICES[Math.floor(rand() * STAR_CHOICES.length)],
      count: Math.floor(rand() * 3000) + 1,
      priceCents,
      keywords: base.keywords,
    });
  }
}

// 2) 收集去重关键字，分配自增 id
const keywordId = new Map();
let nextKw = 1;
for (const p of products) {
  for (const kw of p.keywords) {
    if (!keywordId.has(kw)) keywordId.set(kw, nextKw++);
  }
}

// 3) 型号：Standard / Deluxe / Premium，价格倍率 1 / 1.2 / 1.5（与前端一致）
const VARIANTS = [
  { name: "Standard", multiplier: 1, sort: 0 },
  { name: "Deluxe", multiplier: 1.2, sort: 1 },
  { name: "Premium", multiplier: 1.5, sort: 2 },
];

// 4) 拼 SQL
const lines = [];
lines.push("-- =============================================================");
lines.push("-- 测试数据：100 个商品 + 型号 + 关键字");
lines.push("-- 由 database/generate-seed.mjs 生成，基于原工程 mock 数据");
lines.push("-- 执行前请先执行 schema.sql 建表");
lines.push("-- =============================================================");
lines.push("SET NAMES utf8mb4;");
lines.push("");
lines.push("-- 清空相关表（按依赖倒序）");
lines.push("DELETE FROM order_item;");
lines.push("DELETE FROM cart_item;");
lines.push("DELETE FROM product_keyword;");
lines.push("DELETE FROM product_variant;");
lines.push("DELETE FROM keyword;");
lines.push("DELETE FROM product;");
lines.push("");

// keyword
lines.push("-- 关键字");
lines.push("INSERT INTO keyword (id, name) VALUES");
const kwRows = [...keywordId.entries()].map(
  ([name, id]) => `  (${id}, ${q(name)})`,
);
lines.push(kwRows.join(",\n") + ";");
lines.push("");

// product
lines.push("-- 商品");
lines.push(
  "INSERT INTO product (id, name, image, rating_stars, rating_count, base_price_cents) VALUES",
);
const prodRows = products.map(
  (p) =>
    `  (${q(p.id)}, ${q(p.name)}, ${q(p.image)}, ${p.stars}, ${p.count}, ${p.priceCents})`,
);
lines.push(prodRows.join(",\n") + ";");
lines.push("");

// product_variant
lines.push("-- 商品型号");
lines.push(
  "INSERT INTO product_variant (id, product_id, name, price_cents, sort_order) VALUES",
);
const variantRows = [];
for (const p of products) {
  for (const v of VARIANTS) {
    const price = Math.round(p.priceCents * v.multiplier);
    variantRows.push(
      `  (${q(randomUUID())}, ${q(p.id)}, ${q(v.name)}, ${price}, ${v.sort})`,
    );
  }
}
lines.push(variantRows.join(",\n") + ";");
lines.push("");

// product_keyword
lines.push("-- 商品-关键字关联");
lines.push("INSERT INTO product_keyword (product_id, keyword_id) VALUES");
const pkRows = [];
for (const p of products) {
  for (const kw of p.keywords) {
    pkRows.push(`  (${q(p.id)}, ${keywordId.get(kw)})`);
  }
}
lines.push(pkRows.join(",\n") + ";");
lines.push("");

writeFileSync(
  new URL("./seed-data.sql", import.meta.url),
  lines.join("\n") + "\n",
);

console.log(
  `Generated seed-data.sql: ${products.length} products, ${variantRows.length} variants, ${keywordId.size} keywords, ${pkRows.length} product-keyword links.`,
);
