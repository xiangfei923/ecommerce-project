# 接口需求文档索引

本目录为**每个接口一份需求文档**，供后端开发、测试、前端联调使用。
每份文档结构统一：业务背景 → 请求 → 响应 → 业务规则 → 关键 SQL → 异常/边界 → 关联表。

> 全局约定（金额单位、时间戳、错误码等）见 `../backend-api-design.md` 第 1 节。
> 新手概览见 `../backend-api-design-simple.md` 与 `../data-flow-diagram.md`。

## 接口清单

| 编号 | 接口 | 说明 | 页面 |
| --- | --- | --- | --- |
| 01 | `GET /api/products` | 商品列表（搜索/类别/分页） | 首页、列表页 |
| 02 | `GET /api/products/{id}` | 商品详情 + 型号 | 详情页 |
| 03 | `GET /api/categories` | 类别下拉选项 | 列表页 |
| 04 | `GET /api/cart-items` | 查看购物车 | 结算页 |
| 05 | `POST /api/cart-items` | 加入购物车 | 详情页 |
| 06 | `PUT /api/cart-items/{id}` | 修改数量/配送 | 结算页 |
| 07 | `DELETE /api/cart-items/{id}` | 删除购物车项 | 结算页 |
| 08 | `GET /api/delivery-options` | 配送方式 | 结算页 |
| 09 | `GET /api/payment-summary` | 费用汇总 | 结算页 |
| 10 | `POST /api/orders` | 下单 | 结算页 |
| 11 | `GET /api/orders` | 订单列表 | 订单页 |
| 12 | `GET /api/orders/{orderId}` | 订单详情/物流 | 追踪页 |

## 通用约定摘要

- 前缀 `/api`，`Content-Type: application/json; charset=utf-8`
- 金额单位「分」（整数 `*Cents`）；时间用毫秒时间戳（`*Ms`）
- 状态码：200 成功 / 201 创建 / 204 无内容 / 400 参数错 / 404 不存在 / 500 服务端异常
- 错误响应：`{ "error": "描述", "code": "ERROR_CODE" }`
