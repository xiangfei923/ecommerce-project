import { Product } from "./Product";
import type { ProductType } from "../../types";

interface ProductsGridProps {
  products: ProductType[];
}

export function ProductsGrid({ products }: ProductsGridProps) {
  return (
    <div className="products-grid">
      {products.map((product) => (
        <Product key={product.id} product={product} />
      ))}
    </div>
  );
}