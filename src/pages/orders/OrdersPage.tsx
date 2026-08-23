import dayjs from "dayjs";
import { Fragment, useEffect, useState } from "react";
import { Link } from "react-router";
import { fetchOrders } from "../../api/ordersApi";
import type { OrderType } from "../../types";
import { formatMoney } from "../../utils/money";
import "./OrdersPage.scss";

export function OrdersPage() {
  const [orders, setOrders] = useState<OrderType[]>([]);

  useEffect(() => {
    fetchOrders().then((data) => {
      setOrders(data);
    });
  }, []);

  return (
    <>
      <title>Orders</title>
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
                      <img src={orderProduct.product.image} alt={orderProduct.product.name} />
                    </div>

                    <div className="product-details">
                      <div className="product-name">{orderProduct.product.name}</div>
                      <div className="product-delivery-date">
                        Arriving on: {dayjs(orderProduct?.estimatedDeliveryTimeMs).format("YYYY-MM-DD")}
                      </div>
                      <div className="product-quantity">Quantity: {orderProduct.quantity}</div>
                      <button className="buy-again-button button-primary">
                        <img className="buy-again-icon" src="images/icons/buy-again.png" alt="Buy Again" />
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
