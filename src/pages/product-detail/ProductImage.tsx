interface ProductImageProps {
  image: string;
  name: string;
}

export function ProductImage({ image, name }: ProductImageProps) {
  return (
    <div className="product-image-section">
      <img
        src={image}
        alt={name}
        className="product-image"
      />
    </div>
  );
}
