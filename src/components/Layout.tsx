import { Outlet } from "react-router";
import { Header } from "./Header";

// 公共布局：Header 只渲染一次，子路由通过 <Outlet /> 渲染
export function Layout() {
  return (
    <>
      <Header />
      <Outlet />
    </>
  );
}
