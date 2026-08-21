interface ProductDescriptionProps {
  name: string;
  keywords?: string[];
}

export function ProductDescription({ name, keywords }: ProductDescriptionProps) {
  // 根据商品名称和关键词生成描述
  const generateDescription = () => {
    const category = keywords?.[0] || '商品';
    
    // 根据关键词类型生成不同的描述
    if (keywords?.includes('sports')) {
      return `${name} 是一款专为运动爱好者设计的优质体育用品。采用高品质材料制造，经久耐用，是您运动健身的好伙伴。`;
    } else if (keywords?.includes('apparel') || keywords?.includes('tshirts')) {
      return `${name} 采用优质面料制作，穿着舒适透气。精致做工，简约设计，适合日常穿搭，是您衣橱里的必备单品。`;
    } else if (keywords?.includes('kitchen') || keywords?.includes('appliances')) {
      return `${name} 是一款实用的厨房电器，操作简便，功能齐全。精选优质材料，安全可靠，让您的厨房生活更加便捷。`;
    } else if (keywords?.includes('socks')) {
      return `${name} 采用优质棉质面料，柔软舒适，吸汗透气。弹性好，不易变形，是您日常生活的贴心选择。`;
    } else if (keywords?.includes('basketballs')) {
      return `${name} 采用优质橡胶材质，手感出色，弹跳性能佳。适合室内外使用，是篮球爱好者的理想选择。`;
    } else if (keywords?.includes('toaster')) {
      return `${name} 快速加热，均匀烤色。多档位可调节，满足不同口味需求。不锈钢外壳，美观耐用，是早餐的好帮手。`;
    } else {
      return `${name} 是一款高品质的${category}，精选优质材料，做工精细。实用性强，性价比高，是您生活的理想选择。`;
    }
  };

  return (
    <div className="product-description-section">
      <h2>商品详情</h2>
      <div className="description-content">
        <p>{generateDescription()}</p>
        {keywords && keywords.length > 0 && (
          <p>商品标签：{keywords.join(' · ')}</p>
        )}
      </div>
    </div>
  );
}
