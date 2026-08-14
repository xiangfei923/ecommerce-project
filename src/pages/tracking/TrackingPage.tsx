import { useParams,Link} from "react-router";
import {GoodsShow} from "./GoodsShow";
import { ProgressShow, type DeliveryStatus } from "./ProgressShow";
import { useEffect, useState } from "react";
import { Header } from "../../components/Header";
import dayjs from "dayjs";
import { fetchOrderTracking } from "../../api/ordersApi";
import type { TrackingOrderType } from "../../types";
import "./tracking.css"

function getDeliverStatus(deliverTimeMs:number):DeliveryStatus{
  const now=Date.now();
  if (now>=deliverTimeMs){
    return "Delivered"
  }

  if (now >= deliverTimeMs-24*60*60*1000){
    return "Shipped"
  }
  return "Preparing"
}

export default function TrackingPage(){
  const {orderId}=useParams();
  const [order,setOrder]=useState<TrackingOrderType | null>(null);
  const [requestStatus,setRequestStatus]=useState<"loading" | "success" | "error">("loading")
  useEffect(()=>{
    let isCancelled=false;
    fetchOrderTracking(orderId ?? "").then((data)=>{
      if (isCancelled) return;
      setOrder(data);
      setRequestStatus('success');
    })
    .catch(()=>{
      if (isCancelled)return;
      setRequestStatus("error");
    });

    return ()=>{
      isCancelled=true;
    };
  },[orderId])

if (requestStatus==="loading"){
  return(
    <>
    <title>Tracking</title>
    <Header/>
    <div className="tracking-page">
      <div className="order-tracking">Loading ...</div>
    </div>
    </>
  );
}
if (requestStatus === "error" || !order || order.products?.length === 0){
  return(
  <>
    <title>Tracking</title>
    <Header/>
     <div className="tracking-page">
      <div className="order-tracking">
        <Link className="back-to-orders-link link-primary" to="/orders">View all orders</Link>
        Couldn't find this order. Please try again later.
      </div>
    </div>
  </>
  );
}
const trackingProduct= order.products[0];
const deliveryStatus=getDeliverStatus(trackingProduct.estimatedDeliveryTimeMs);

return (
  <>
  <title>Tracking</title>
  <Header/>
  <div className="tracking-page">
      <div className="order-tracking">
        <Link className="back-to-orders-link link-primary" to="/orders">View all orders</Link>
       <div className="product-info">Order:{order.id} </div>
       <div className="delivery-date">
          Arriving on {dayjs(trackingProduct.estimatedDeliveryTimeMs).format("dddd, MMMM D")}
      </div>

      <GoodsShow product={trackingProduct}/>
      <ProgressShow status={deliveryStatus}/>
      </div>
    </div>
  </>
)
};
