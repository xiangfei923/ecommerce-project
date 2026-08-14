// 物流进度组件：只负责渲染"三段步骤文字 + 绿色进度条"
export type DeliveryStatus = "Preparing" | "Shipped" | "Delivered";

const PROGRESS_BAR_WIDTH: Record<DeliveryStatus, string> = {
  Preparing: "33%",
  Shipped: "66%",
  Delivered: "100%",
};

// 当前物流状态
interface ProgressShowProps {
  status: DeliveryStatus;
}

export function ProgressShow({ status }: ProgressShowProps) {
  return (
    <>
      {/* 三段步骤文字：谁和当前状态一致，谁就加上 current-status 高亮 */}
      <div className="progress-labels-container">
        <div
          className={status === "Preparing" ? "progress-label current-status" : "progress-label"}
        >
          Preparing
        </div>
        <div
          className={status === "Shipped" ? "progress-label current-status" : "progress-label"}
        >
          Shipped
        </div>
        <div
          className={status === "Delivered" ? "progress-label current-status" : "progress-label"}
        >
          Delivered
        </div>
      </div>

      {/* 绿色进度条：根据状态查表得到宽度，用行内样式设置 */}
      <div className="progress-bar-container">
        <div className="progress-bar" style={{ width: PROGRESS_BAR_WIDTH[status] }}></div>
      </div>
    </>
  );
}