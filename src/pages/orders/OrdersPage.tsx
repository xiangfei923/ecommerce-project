import dayjs from "dayjs";
import { useState, useEffect, Fragment } from "react";
import { Link } from "react-router";
import { Header } from "../../components/Header";
import { formatMoney } from "../../utils/money";
import { fetchOrders } from "../../api/ordersApi";
import { useAppDispatch } from "../../store/hooks";
import { addToCart } from "../../store/cartSlice";
import type { OrderType } from "../../types";
import "./OrdersPage.css";

export function OrdersPage() {
  const [orders, setOrders] = useState<OrderType[]>([]);
  const dispatch = useAppDispatch();

  useEffect(() => {
    fetchOrders().then((data) => {
      setOrders(data);
    });
  }, []);

  return (
    <>
      <title>Orders</title>
      <Header />
      <div className="orders-page">
        <div className="page-title">Your Orders</div>
        <div className="orders-grid">
          {orders.map((order) => (
            <div key={order.id} className="order-container">
              <div className="order-header">
                <div className="order-header-left-section">
                  <div className="order-date">
                    <div className="order-header-label">Order Placed: </div>
                    <div>{dayjs(order.orderTimeMs).format("MMMM D")}</div>
                  </div>
                  <div className="order-total">
                    <div className="order-header-label">Total:</div>
                    <div>{formatMoney(order.totalCostCents)}</div>
                  </div>
                </div>

                <div className="order-header-right-section">
                  <div className="order-header-label">Order ID:</div>
                  <div>{order.id}</div>
                </div>
              </div>

              <div className="order-details-grid">
                {order.products.map((orderProduct) => (
                  <Fragment key={orderProduct.productId}>
                    <div className="product-image-container">
                      {/* 懒加载图片 */}
                      <img 
                        src={orderProduct.product.image} 
                        alt={orderProduct.product.name}
                        loading="lazy"
                      />
                    </div>

                    <div className="product-details">
                      <div className="product-name">{orderProduct.product.name}</div>
                      <div className="product-delivery-date">
                        Arriving on: {dayjs(orderProduct?.estimatedDeliveryTimeMs).format("YYYY-MM-DD")}
                      </div>
                      <div className="product-quantity">Quantity: {orderProduct.quantity}</div>
                      <button
                        className="buy-again-button button-primary"
                        onClick={() => dispatch(addToCart({ productId: orderProduct.productId, quantity: 1 }))}
                      >
                        <img 
                          className="buy-again-icon" 
                          src="images/icons/buy-again.png" 
                          alt="Buy Again"
                          loading="lazy"
                        />
                        <span className="buy-again-message">Add to Cart</span>
                      </button>
                    </div>

                    <div className="product-actions">
                      <Link to={`/tracking/${order.id}`}>
                        <button className="track-package-button button-secondary">Track package</button>
                      </Link>
                    </div>
                  </Fragment>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
