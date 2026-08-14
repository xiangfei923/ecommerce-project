import { Routes, Route } from 'react-router';
import { useEffect } from 'react';
import { useAppDispatch } from './store/hooks';
import { fetchCart } from './store/cartSlice';
import { HomePage } from './pages/home/HomePage';
import { CheckoutPage } from './pages/checkout/CheckoutPage';
import { OrdersPage } from './pages/orders/OrdersPage';
import TrackingPage from './pages/tracking/TrackingPage';
import './App.css';

function App() {
  const dispatch = useAppDispatch();

  // 应用启动后，先拉取一次购物车数据
  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  return (
    <Routes>
      <Route index element={<HomePage />} />
      <Route path="checkout" element={<CheckoutPage />} />
      <Route path="orders" element={<OrdersPage />} />
      <Route path="/tracking/:orderId" element={<TrackingPage />} />
    </Routes>
  );
}

export default App;