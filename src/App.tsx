import { useEffect } from 'react';
import { Route, Routes } from 'react-router';
import './App.scss';
import { Layout } from './components/Layout';
import { CheckoutPage } from './pages/checkout/CheckoutPage';
import { HomePage } from './pages/home/HomePage';
import { OrdersPage } from './pages/orders/OrdersPage';
import { ProductDetailPage } from './pages/products/ProductDetailPage';
import { ProductsPage } from './pages/products/ProductsPage';
import TrackingPage from './pages/tracking/TrackingPage';
import { fetchCart } from './store/cartSlice';
import { useAppDispatch } from './store/hooks';

function App() {
  const dispatch = useAppDispatch();

  // 应用启动后，先拉取一次购物车数据
  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  return (
    <Routes>
      {/* 共用公共布局（Header + Outlet） */}
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="products/:productId" element={<ProductDetailPage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="/tracking/:orderId" element={<TrackingPage />} />
      </Route>

      {/* 结账页使用自己专属的极简 header，不套用公共布局 */}
      <Route path="checkout" element={<CheckoutPage />} />
    </Routes>
  );
}

export default App;
