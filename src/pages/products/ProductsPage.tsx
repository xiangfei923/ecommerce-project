import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import { fetchProducts } from "../../api/productsApi";
import type { ProductType } from "../../types";
import { ProductsGrid } from "./ProductsGrid";
import "./ProductsPage.scss";

export function ProductsPage() {
  const [products, setProducts] = useState<ProductType[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();

  // 搜索条件全部来源于 URL，刷新页面时会自动回填
  const search = searchParams.get("search") ?? "";
  const category = searchParams.get("keywords") ?? "";

  useEffect(() => {
    fetchProducts().then((data) => setProducts(data));
  }, []);

  // 从所有商品的 keywords 聚合去重，生成类别下拉选项
  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((product) => {
      product.keywords?.forEach((keyword) => set.add(keyword));
    });
    return Array.from(set).sort();
  }, [products]);

  // 前端本地过滤：按搜索词（匹配名称或关键字）+ 类别筛选
  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase();
    return products.filter((product) => {
      const matchesCategory = category
        ? product.keywords?.includes(category)
        : true;

      const matchesSearch = term
        ? product.name.toLowerCase().includes(term) ||
          product.keywords?.some((keyword) =>
            keyword.toLowerCase().includes(term),
          )
        : true;

      return matchesCategory && matchesSearch;
    });
  }, [products, search, category]);

  // 更新 URL 上的某个查询参数（空值则移除该参数）
  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    setSearchParams(next, { replace: true });
  };

  return (
    <>
      <title>Products</title>
      <div className="products-page">
        <div className="products-toolbar">
          <input
            className="products-search"
            type="text"
            placeholder="Search products"
            value={search}
            onChange={(event) => updateParam("search", event.target.value)}
          />

          <select
            className="products-category"
            value={category}
            onChange={(event) => updateParam("keywords", event.target.value)}
          >
            <option value="">All categories</option>
            {categories.map((keyword) => (
              <option key={keyword} value={keyword}>
                {keyword}
              </option>
            ))}
          </select>

          <span className="products-result-count">
            {filteredProducts.length} products
          </span>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="products-empty">No products match your search.</div>
        ) : (
          <ProductsGrid products={filteredProducts} />
        )}
      </div>
    </>
  );
}
