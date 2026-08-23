import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import "./Carousel.scss";

export interface CarouselSlide {
  id: string; // 关联的商品 id，用于点击跳转
  image: string;
  name: string;
}

interface CarouselProps {
  slides: CarouselSlide[];
  intervalMs?: number;
}

// 轮播图：自动轮播 + 手动切换，点击某张跳转到对应商品详情页
export function Carousel({ slides, intervalMs = 4000 }: CarouselProps) {
  const [current, setCurrent] = useState(0);
  const navigate = useNavigate();

  const total = slides.length;

  // 自动轮播
  useEffect(() => {
    if (total <= 1) return;
    const timer = window.setInterval(() => {
      setCurrent((prev) => (prev + 1) % total);
    }, intervalMs);
    return () => window.clearInterval(timer);
  }, [total, intervalMs]);

  if (total === 0) return null;

  const goTo = (index: number) => setCurrent((index + total) % total);
  const prev = () => goTo(current - 1);
  const next = () => goTo(current + 1);

  return (
    <div className="carousel" data-testid="carousel">
      <div
        className="carousel-track"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {slides.map((slide) => (
          <button
            key={slide.id}
            className="carousel-slide"
            onClick={() => navigate(`/products/${slide.id}`)}
            aria-label={`View ${slide.name}`}
          >
            <img src={slide.image} alt={slide.name} />
            <div className="carousel-caption">{slide.name}</div>
          </button>
        ))}
      </div>

      {total > 1 && (
        <>
          <button
            className="carousel-arrow carousel-arrow-prev"
            onClick={prev}
            aria-label="Previous slide"
          >
            ‹
          </button>
          <button
            className="carousel-arrow carousel-arrow-next"
            onClick={next}
            aria-label="Next slide"
          >
            ›
          </button>

          <div className="carousel-dots">
            {slides.map((slide, index) => (
              <button
                key={slide.id}
                className={
                  index === current ? "carousel-dot active" : "carousel-dot"
                }
                onClick={() => goTo(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
