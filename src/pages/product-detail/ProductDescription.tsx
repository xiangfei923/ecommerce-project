interface ProductDescriptionProps {
  keywords?: string[];
}

export function ProductDescription({ keywords }: ProductDescriptionProps) {
  return (
    <div className="product-description-section">
      <h2>商品详情</h2>
      <div className="description-content">
        <p>这是一款优质的商品，性价比高，值得购买。</p>
        {keywords && keywords.length > 0 && (
          <p>商品关键词：{keywords.join("、")}</p>
        )}
      </div>
    </div>
  );
}
