import { useEffect, useState } from "react";
import { Header } from "../../components/Header";
import { ProductsGrid } from "./ProductsGrid";
import { fetchProducts } from "../../api/productsApi";
import type { ProductType } from "../../types";
import "./HomePage.css";

export function HomePage() {
  const [products, setProducts] = useState<ProductType[]>([]);

  useEffect(() => {
    const getHomeData = async () => {
      const data = await fetchProducts();
      setProducts(data);
    };

    getHomeData();
  }, []);

  return (
    <>
      <title>Ecommerce Project</title>
      <Header />
      <div className="home-page">
        <ProductsGrid products={products} />
      </div>
    </>
  );
}