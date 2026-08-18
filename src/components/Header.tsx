import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { useAppSelector } from "../store/hooks";
import { selectCartItemCount } from "../store/cartSlice";
import "./header.css";

export function Header() {
  // 直接读取"购物车商品总数量"，计算逻辑已经封装在 cartSlice 里
  const totalQuantity = useAppSelector(selectCartItemCount);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(
    () => searchParams.get("q") ?? "",
  );

  // 当 URL 中的搜索关键词变化时（比如前进/后退、直接修改地址栏），同步输入框内容
  useEffect(() => {
    setSearchTerm(searchParams.get("q") ?? "");
  }, [searchParams]);

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedTerm = searchTerm.trim();
    navigate(
      trimmedTerm ? `/search?q=${encodeURIComponent(trimmedTerm)}` : "/search",
    );
  };

  return (
    <div className="header">
      <div className="left-section">
        <Link to="/" className="header-link">
          <img className="logo" src="images/logo-white.png" alt="Logo" />
          <img
            className="mobile-logo"
            src="images/mobile-logo-white.png"
            alt="Mobile Logo"
          />
        </Link>
      </div>

      <form className="middle-section" onSubmit={handleSearchSubmit}>
        <input
          className="search-bar"
          type="text"
          placeholder="Search"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
        />
        <button className="search-button" type="submit">
          <img
            className="search-icon"
            src="images/icons/search-icon.png"
            alt="Search"
          />
        </button>
      </form>

      <div className="right-section">
        <Link className="orders-link header-link" to="/orders">
          <span className="orders-text">Orders</span>
        </Link>

        <Link className="cart-link header-link" to="/checkout">
          <img
            className="cart-icon"
            src="images/icons/cart-icon.png"
            alt="Cart"
          />
          <div className="cart-quantity">{totalQuantity}</div>
          <div className="cart-text">Cart</div>
        </Link>
      </div>
    </div>
  );
}
