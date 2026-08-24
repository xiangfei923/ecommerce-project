package com.ecommerce.dao.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.ecommerce.dao.entity.Product;
import org.apache.ibatis.annotations.Mapper;

/**
 * 商品 Mapper 接口
 * 继承 MyBatis-Plus 的 BaseMapper，自动获得基础 CRUD 方法
 */
@Mapper  // 标记这是一个 MyBatis Mapper 接口
public interface ProductMapper extends BaseMapper<Product> {
    
    // 这里暂时不需要写任何方法！
    // 因为 BaseMapper 已经提供了常用的方法：
    // - selectList()：查询所有
    // - selectById()：根据 ID 查询
    // - insert()：插入
    // - updateById()：更新
    // - deleteById()：删除
    // 等等...
    
    // 如果需要自定义查询，可以在这里添加方法
    // 例如：
    // List<Product> searchByKeyword(String keyword);
}
