import type { ProductType } from "../../types";
import { Product } from "./Product";

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
