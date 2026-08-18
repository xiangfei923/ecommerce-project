import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { Header } from "../../components/Header";
import { ProductsGrid } from "../home/ProductsGrid";
import { fetchProducts } from "../../api/productsApi";
import type { ProductType } from "../../types";
import "../home/HomePage.css";
import "./SearchPage.css";

// 根据关键词匹配商品名称或 keywords 字段（大小写不敏感）
function matchesSearchTerm(product: ProductType, term: string): boolean {
   // 把搜索词全部转成小写，实现忽略大小写搜索
  const lowerTerm = term.toLowerCase();

  // 判断商品名字是否包含搜索词，名字也转小写
  const nameMatches = product.name.toLowerCase().includes(lowerTerm);

  const keywordMatches = product.keywords?.some((keyword) =>
    keyword.toLowerCase().includes(lowerTerm),
  );

  return nameMatches || Boolean(keywordMatches);
}

export function SearchPage() {
  //读取浏览器网址 URL 上面的查询参数。
  const [searchParams] = useSearchParams();
  const searchTerm = searchParams.get("q") ?? "";

  const [products, setProducts] = useState<ProductType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isCancelled = false;

    const getSearchResults = async () => {
      setIsLoading(true);
      const data = await fetchProducts();
      if (!isCancelled) {
        setProducts(data);
        setIsLoading(false);
      }
    };

    getSearchResults();

    return () => {
      isCancelled = true;
    };
  }, []);

  const trimmedTerm = searchTerm.trim();
  const filteredProducts = trimmedTerm
    ? products.filter((product) => matchesSearchTerm(product, trimmedTerm))
    : products;

  return (
    <>
      <title>Search Results - Ecommerce Project</title>
      <Header />
      <div className="home-page search-page">
        <div className="search-results-heading">
          {trimmedTerm ? (
            <>
              Search results for <strong>&quot;{trimmedTerm}&quot;</strong>
            </>
          ) : (
            "All Products"
          )}
        </div>

        {!isLoading && filteredProducts.length === 0 && (
          <div className="no-results-message">
            No products found matching &quot;{trimmedTerm}&quot;. Try a different keyword.
          </div>
        )}

        <ProductsGrid products={filteredProducts} />
      </div>
    </>
  );
}
