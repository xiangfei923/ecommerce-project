// 这个文件的作用：给组件准备两个"自带类型"的 Hooks
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './store';

// useAppDispatch：带类型的 dispatch
// 派发动作（例如 dispatch(fetchCart())）时，TypeScript 会自动给出提示
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();

// useAppSelector：带类型的 selector
// 读取状态（例如 useAppSelector(selectCartItems)）时，数据会自动带上类型
export const useAppSelector = useSelector.withTypes<RootState>();
