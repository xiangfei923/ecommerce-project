import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import { selectCartItemCount } from '../store/cartSlice';
import { useAppSelector } from '../store/hooks';
import './header.scss';

export function Header() {
  // 直接读取"购物车商品总数量"，计算逻辑已经封装在 cartSlice 里
  const totalQuantity = useAppSelector(selectCartItemCount);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  // 提交搜索：跳转到商品列表页，并把搜索词写到 URL 上
  const handleSearch = (event: FormEvent) => {
    event.preventDefault();
    const term = search.trim();
    navigate(term ? `/products?search=${encodeURIComponent(term)}` : '/products');
  };

  return (
    <div className="header">
      <div className="left-section">
        <Link to="/" className="header-link">
          <img className="logo" src="images/logo-white.png" alt="Logo" />
          <img className="mobile-logo" src="images/mobile-logo-white.png" alt="Mobile Logo" />
        </Link>
      </div>

      <form className="middle-section" onSubmit={handleSearch}>
        <input
          className="search-bar"
          type="text"
          placeholder="Search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <button className="search-button" type="submit">
          <img className="search-icon" src="images/icons/search-icon.png" alt="Search" />
        </button>
      </form>

      <div className="right-section">
        <Link className="orders-link header-link" to="/orders">
          <span className="orders-text">Orders</span>
        </Link>

        <Link className="cart-link header-link" to="/checkout">
          <img className="cart-icon" src="images/icons/cart-icon.png" alt="Cart" />
          <div className="cart-quantity">{totalQuantity}</div>
          <div className="cart-text">Cart</div>
        </Link>
      </div>
    </div>
  );
}