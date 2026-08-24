package com.ecommerce.dao.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 商品实体类
 * 对应数据库 products 表
 */
@Data  // Lombok：自动生成 getter、setter、toString 等方法
@TableName("products")  // MyBatis-Plus：指定对应的数据库表名
public class Product {

    /**
     * 商品 ID（主键）
     */
    @TableId  // 标记这是主键字段
    private String id;

    /**
     * 商品名称
     */
    private String name;

    /**
     * 商品图片路径
     */
    private String image;

    /**
     * 价格（分）
     * 为什么用分？避免浮点数精度问题
     * 例如：10.90 元 = 1090 分
     */
    @TableField("price_cents")  // 指定数据库字段名（因为 Java 用驼峰命名）
    private Integer priceCents;

    /**
     * 评分（星级）
     * 范围：0.0 - 5.0
     */
    @TableField("rating_stars")
    private BigDecimal ratingStars;

    /**
     * 评分人数
     */
    @TableField("rating_count")
    private Integer ratingCount;

    /**
     * 关键词（逗号分隔）
     * 例如："socks,sports,apparel"
     */
    private String keywords;

    /**
     * 创建时间
     */
    @TableField("created_at")
    private LocalDateTime createdAt;

    /**
     * 更新时间
     */
    @TableField("updated_at")
    private LocalDateTime updatedAt;
}
