package com.ecommerce.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.ecommerce.dao.entity.Product;
import com.ecommerce.dao.mapper.ProductMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * 商品业务逻辑类
 * 负责处理商品相关的业务逻辑
 */
@Service  // 标记这是一个 Service 类，Spring 会自动管理
public class ProductService {

    /**
     * 注入 ProductMapper
     * @Autowired：自动装配，Spring 会自动找到 ProductMapper 并注入
     */
    @Autowired
    private ProductMapper productMapper;

    /**
     * 获取所有商品
     * 
     * @return 商品列表
     */
    public List<Product> getAllProducts() {
        // 调用 Mapper 的 selectList 方法
        // 参数 null 表示没有查询条件，查询所有
        return productMapper.selectList(null);
    }

    /**
     * 根据 ID 查询商品
     * 
     * @param id 商品 ID
     * @return 商品对象，如果不存在则返回 null
     */
    public Product getProductById(String id) {
        // 调用 Mapper 的 selectById 方法
        return productMapper.selectById(id);
    }

    /**
     * 搜索商品
     * 支持按商品名称或关键词搜索
     * 
     * @param keyword 搜索关键词
     * @return 匹配的商品列表
     */
    public List<Product> searchProducts(String keyword) {
        // 如果关键词为空，返回所有商品
        if (keyword == null || keyword.trim().isEmpty()) {
            return getAllProducts();
        }

        // 创建查询条件构造器
        QueryWrapper<Product> wrapper = new QueryWrapper<>();
        
        // 添加查询条件：name LIKE '%keyword%' OR keywords LIKE '%keyword%'
        wrapper.like("name", keyword)           // name LIKE '%keyword%'
               .or()                             // OR
               .like("keywords", keyword);       // keywords LIKE '%keyword%'
        
        // 执行查询
        return productMapper.selectList(wrapper);
    }

    /**
     * 获取热门商品（评分高的商品）
     * 
     * @param limit 返回数量
     * @return 热门商品列表
     */
    public List<Product> getHotProducts(int limit) {
        // 创建查询条件
        QueryWrapper<Product> wrapper = new QueryWrapper<>();
        
        // 按评分排序：rating_stars DESC, rating_count DESC
        wrapper.orderByDesc("rating_stars", "rating_count")
               .last("LIMIT " + limit);  // 限制返回数量
        
        return productMapper.selectList(wrapper);
    }

    /**
     * 统计商品总数
     * 
     * @return 商品总数
     */
    public long countProducts() {
        // 调用 Mapper 的 selectCount 方法
        return productMapper.selectCount(null);
    }
}
