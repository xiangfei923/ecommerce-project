import { Link } from "react-router";

interface ProductBreadcrumbProps {
  productName: string;
}

export function ProductBreadcrumb({ productName }: ProductBreadcrumbProps) {
  return (
    <div className="breadcrumb">
      <Link to="/">首页</Link>
      <span> &gt; </span>
      <span>{productName}</span>
    </div>
  );
}
