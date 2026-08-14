// 创建整个应用的 Redux 全局状态仓库（store）.所有组件需要共享的数据，都会集中放在这个仓库里统一管理
import { configureStore } from '@reduxjs/toolkit';
import cartReducer from './cartSlice';

export const store = configureStore({
  reducer: {
    // cart：购物车模块
    cart: cartReducer,
  },
});

// RootState：整个仓库（store）的状态类型 "store 里所有数据合在一起"
export type RootState = ReturnType<typeof store.getState>;

// AppDispatch：整个仓库（store）的 dispatch 方法类型
// 在组件里派发动作时，TypeScript 会自动提示有哪些动作可以用
export type AppDispatch = typeof store.dispatch;
