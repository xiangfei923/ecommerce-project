import { useInView } from "../hooks/useInView";

type LazyImageProps = React.ImgHTMLAttributes<HTMLImageElement> & {
  src: string;
  alt: string;
};

/**
 * 图片懒加载组件：滚动到视口内时才真正设置 src 去加载图片。
 * 基于 useInView Hook（IntersectionObserver）实现。
 */
export function LazyImage({ src, alt, ...rest }: LazyImageProps) {
  const [ref, inView] = useInView<HTMLImageElement>();

  return (
    <img
      ref={ref}
      src={inView ? src : undefined}
      alt={alt}
      loading="lazy"
      {...rest}
    />
  );
}
