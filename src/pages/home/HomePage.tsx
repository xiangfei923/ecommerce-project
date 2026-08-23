import { useEffect, useState } from "react";
import { Link } from "react-router";
import { fetchProducts } from "../../api/productsApi";
import { Carousel, type CarouselSlide } from "../../components/Carousel";
import "./HomePage.scss";

export function HomePage() {
  const [slides, setSlides] = useState<CarouselSlide[]>([]);

  useEffect(() => {
    fetchProducts().then((products) => {
      // 取前 5 个商品作为轮播 banner，每张关联对应的商品 id
      const bannerSlides = products.slice(0, 5).map((product) => ({
        id: product.id,
        image: product.image,
        name: product.name,
      }));
      setSlides(bannerSlides);
    });
  }, []);

  return (
    <>
      <title>Ecommerce Project</title>
      <div className="home-page">
        <section className="home-hero">
          <Carousel slides={slides} />
        </section>

        <section className="home-cta">
          <h2>Discover our products</h2>
          <p>Browse the full catalog and find what you need.</p>
          <Link className="home-shop-button button-primary" to="/products">
            Shop all products
          </Link>
        </section>
      </div>
    </>
  );
}
