# 03. 查询类别列表

`GET /api/categories`

## 一句话说明
把所有商品用到的**类别标签**查出来、去掉重复，给前端做那个"类别下拉框"用。

## 什么时候会用到
用户打开**商品列表页**时，页面上的类别下拉框需要选项。

## 前端会传什么给你
啥也不用传。

例子：`GET /api/categories`

## 你要返回什么（响应，状态码 200）
一个字符串数组，按字母排好序：

```json
["apparel", "appliances", "bathroom", "dining", "kitchen", "plates", "shoes", "sports"]
```

## 后端要做的事（业务规则）
1. 只返回**真的有商品在用**的标签（没有商品用的标签不返回）。
2. 去重、按名字排序。
3. 一个都没有就返回空数组 `[]`。

## SQL 怎么写
```sql
SELECT DISTINCT k.name          -- DISTINCT = 去掉重复的标签名
FROM keyword k
JOIN product_keyword pk ON pk.keyword_id = k.id   -- 只留下有商品在用的标签
ORDER BY k.name;
```
> 为什么要 `JOIN product_keyword`？因为 `keyword` 表里可能有一些标签其实没有商品在用，join 一下就能过滤掉这些"空标签"。

## 可能出错的情况
| 情况 | 怎么办 |
| --- | --- |
| 一个标签都没有 | 返回 `[]` |

## 会用到哪些表
`keyword`（标签）、`product_keyword`（商品-标签关联）

## 备注
这个接口和 `01 商品列表` 配合用：用户在下拉框选了 `kitchen`，前端就拿这个值当 `category` 参数去调商品列表接口。
