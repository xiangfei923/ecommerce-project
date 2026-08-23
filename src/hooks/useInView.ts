import { useEffect, useRef, useState } from "react";

/**
 * 懒加载 Hook：基于 IntersectionObserver 判断元素是否进入视口。
 * 一旦进入视口就置为 true 并停止观察（只触发一次）。
 *
 * @param rootMargin 视口的外扩边距，提前触发加载，默认 "200px"
 * @param threshold  可见比例阈值，默认 0（露出一点就算进入）
 * @returns [ref, inView] ref 挂到目标元素上，inView 表示是否已进入视口
 */
export function useInView<T extends Element>(
  rootMargin: string = "200px",
  threshold: number = 0,
): [React.RefObject<T | null>, boolean] {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState<boolean>(false);

  useEffect(() => {
    // 已经进入过视口，无需再观察
    if (inView) return;

    const el = ref.current;
    if (!el) return;

    // 测试环境（jsdom）等不支持 IntersectionObserver 时，直接加载
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin, threshold },
    );

    observer.observe(el);

    return () => observer.disconnect();
  }, [inView, rootMargin, threshold]);

  return [ref, inView];
}
