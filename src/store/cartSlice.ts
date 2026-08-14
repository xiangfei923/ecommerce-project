// 定义"购物车模块"的状态、、数据读取（Selector）、以及最终的 reducer
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchCartItems, addCartItem, deleteCartItem as deleteCartItemApi, updateCartItemDeliveryOption } from '../api/cartApi';
import { placeOrder as placeOrderApi } from '../api/ordersApi';
import type { CartItemType } from '../types';
import type { RootState } from './store';

// ---------- 状态定义 ----------
interface CartState {
  items: CartItemType[]; // 购物车里的所有商品
  status: 'idle' | 'loading' | 'succeeded' | 'failed'; 
}
const initialState: CartState = {
  items: [],
  status: 'idle',
};

// 异步动作（Thunk） Thunk 作用：处理"需要请求后端"的动作，请求成功后再更新状态

// 拉取购物车数据（进入页面时、增删改商品后都会重新调用）
export const fetchCart = createAsyncThunk<CartItemType[]>(
  'cart/fetchCart',
  async () => {
    return fetchCartItems();
  }
);

// 把商品加入购物车，加入成功后重新拉取一次购物车
export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async (
    { productId, quantity }: { productId: string; quantity: number },
    { dispatch }
  ) => {
    await addCartItem(productId, quantity);
    dispatch(fetchCart());
  }
);

// 删除购物车中的某件商品，删除成功后重新拉取一次购物车
export const deleteCartItem = createAsyncThunk(
  'cart/deleteCartItem',
  async (productId: string, { dispatch }) => {
    await deleteCartItemApi(productId);
    dispatch(fetchCart());
  }
);

// 修改某件商品的配送方式，修改成功后重新拉取一次购物车
export const updateDeliveryOption = createAsyncThunk(
  'cart/updateDeliveryOption',
  async (
    { productId, deliveryOptionId }: { productId: string; deliveryOptionId: string },
    { dispatch }
  ) => {
    await updateCartItemDeliveryOption(productId, deliveryOptionId);
    dispatch(fetchCart());
  }
);

// 提交订单，下单成功后重新拉取一次购物车（此时购物车已被清空）
export const placeOrder = createAsyncThunk(
  'cart/placeOrder',
  async (_, { dispatch }) => {
    await placeOrderApi();
    dispatch(fetchCart());
  }
);



//  数据读取（Selector） Selector作用：组件用它从 store 里"取数据"，不用自己写取数据的逻辑

// 读取购物车里的所有商品
export function selectCartItems(state: RootState): CartItemType[] {
  return state.cart.items;
}

// 读取购物车里的商品总数量
export function selectCartItemCount(state: RootState): number {
  return state.cart.items.reduce((sum, item) => sum + item.quantity, 0);
}


// Slice（切片）定义
const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // 拉取购物车成功：把后端返回的数据填进状态，并把加载状态改为 succeeded
    builder.addCase(fetchCart.fulfilled, (state, action) => {
      state.items = action.payload;
      state.status = 'succeeded';
    });
  },
});

export default cartSlice.reducer;
