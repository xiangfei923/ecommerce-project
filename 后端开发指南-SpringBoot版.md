# 电商项目后端开发指南 - Spring Boot 版（IntelliJ IDEA）

## 目录
1. [环境准备](#环境准备)
2. [创建 Spring Boot 项目](#创建-spring-boot-项目)
3. [数据库设置](#数据库设置)
4. [项目结构](#项目结构)
5. [编写后端代码](#编写后端代码)
6. [测试接口](#测试接口)
7. [连接前端](#连接前端)
8. [常见问题](#常见问题)

---

## 环境准备

### 1. 安装 JDK
1. 下载 [JDK 17](https://www.oracle.com/java/technologies/downloads/) 或更高版本
2. 安装后，验证：
```powershell
java -version
# 应该显示: java version "17.x.x" 或更高
```

### 2. 安装 IntelliJ IDEA
1. 下载 [IntelliJ IDEA](https://www.jetbrains.com/idea/download/)
2. 推荐使用 **Community Edition**（免费版）或 **Ultimate Edition**
3. 安装时选择：
   - ✅ Maven
   - ✅ Spring
   - ✅ Database tools

### 3. 安装 MySQL
**选项 A：XAMPP（推荐新手）**
1. 下载 [XAMPP](https://www.apachefriends.org/)
2. 安装后启动 MySQL
3. 访问 http://localhost/phpmyadmin

**选项 B：MySQL Server**
1. 下载 [MySQL Community Server](https://dev.mysql.com/downloads/mysql/)
2. 安装时记住 root 密码

### 4. 安装 Postman（测试 API）
- 下载 [Postman](https://www.postman.com/downloads/)

---

## 创建 Spring Boot 项目

### 方法 1：使用 Spring Initializr（推荐）

#### 步骤 1：访问 Spring Initializr
1. 打开浏览器访问：https://start.spring.io/
2. 配置项目：

**项目元数据**：
- **Project**: Maven
- **Language**: Java
- **Spring Boot**: 3.2.x（最新稳定版）
- **Packaging**: Jar
- **Java**: 17

**项目信息**：
- **Group**: com.ecommerce
- **Artifact**: backend
- **Name**: backend
- **Package name**: com.ecommerce.backend

#### 步骤 2：添加依赖
点击 "ADD DEPENDENCIES"，搜索并添加：

- ✅ **Spring Web** - 创建 REST API
- ✅ **Spring Data JPA** - 数据库操作
- ✅ **MySQL Driver** - MySQL 连接
- ✅ **Lombok** - 简化代码（自动生成 getter/setter）
- ✅ **Validation** - 数据验证

#### 步骤 3：生成项目
1. 点击 "GENERATE"
2. 下载 `backend.zip`
3. 解压到：`e:\react-course\ecommerce-project\backend-springboot`

#### 步骤 4：在 IDEA 中打开项目
1. 打开 IntelliJ IDEA
2. 选择 **File → Open**
3. 选择解压的文件夹
4. 等待 Maven 下载依赖（首次可能需要几分钟）

---

### 方法 2：直接在 IntelliJ IDEA 创建

1. 打开 IntelliJ IDEA
2. **File → New → Project**
3. 选择左侧 **Spring Initializr**
4. 配置：
   - **Server URL**: https://start.spring.io
   - **Name**: backend
   - **Location**: `e:\react-course\ecommerce-project\backend-springboot`
   - **Language**: Java
   - **Type**: Maven
   - **Group**: com.ecommerce
   - **Java**: 17
5. 点击 **Next**
6. 选择依赖：Spring Web, Spring Data JPA, MySQL Driver, Lombok, Validation
7. 点击 **Create**

---

## 数据库设置

### 步骤 1：创建数据库

**使用 phpMyAdmin**（XAMPP）：
1. 访问 http://localhost/phpmyadmin
2. 点击 "新建"
3. 数据库名：`ecommerce`
4. 排序规则：`utf8mb4_unicode_ci`
5. 点击 "创建"

**或使用 MySQL 命令行**：
```sql
mysql -u root -p

CREATE DATABASE ecommerce CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
exit;
```

### 步骤 2：创建数据表

在 `backend-springboot/src/main/resources` 创建 `schema.sql`：

```sql
-- 商品表
CREATE TABLE IF NOT EXISTS products (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  image VARCHAR(500) NOT NULL,
  price_cents INT NOT NULL,
  rating_stars DECIMAL(2,1) NOT NULL DEFAULT 0.0,
  rating_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_name (name),
  INDEX idx_price (price_cents),
  INDEX idx_rating (rating_stars)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 商品关键词表
CREATE TABLE IF NOT EXISTS product_keywords (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id VARCHAR(50) NOT NULL,
  keyword VARCHAR(100) NOT NULL,
  
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  INDEX idx_keyword (keyword),
  INDEX idx_product_keyword (product_id, keyword)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 购物车表
CREATE TABLE IF NOT EXISTS cart_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id VARCHAR(50) NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  delivery_option_id VARCHAR(50) NOT NULL DEFAULT '1',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  INDEX idx_product_id (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 步骤 3：插入测试数据

在 `backend-springboot/src/main/resources` 创建 `data.sql`：

```sql
-- 清空现有数据（开发环境）
DELETE FROM product_keywords;
DELETE FROM products;

-- 插入商品
INSERT INTO products (id, name, image, price_cents, rating_stars, rating_count) VALUES
('e43638ce-6aa0-4b85-b27f-e1d07eb678c6', 'Black and Gray Athletic Cotton Socks - 6 Pairs', 'images/products/athletic-cotton-socks-6-pairs.jpg', 1090, 4.5, 87),
('15b6fc6f-327a-4ec4-896f-486349e85a3d', 'Intermediate Size Basketball', 'images/products/intermediate-composite-basketball.jpg', 2095, 4.0, 127),
('83d4ca15-0f35-48f5-b7a3-1ea210004f2e', 'Adults Plain Cotton T-Shirt - 2 Pack', 'images/products/adults-plain-cotton-tshirt-2-pack-teal.jpg', 799, 4.5, 56),
('54e0eccd-8f36-462b-b68a-8182611d9add', 'Black 2-Slot Toaster', 'images/products/2-slot-toaster-white.jpg', 1899, 5.0, 2197),
('3ebe75dc-64d2-4137-8860-1f5a963e534b', '6 Piece White Dinner Plate Set', 'images/products/elegant-white-dinner-plate-set.jpg', 2067, 4.0, 37),
('8c9c52b5-5a19-4bcb-a5d1-158a74287c53', 'Plain Hooded Fleece Sweatshirt', 'images/products/men-cozy-fleece-hoodie-light-teal.jpg', 2400, 4.5, 317),
('dd82ca78-a18b-4e2a-9250-31e67412f98d', 'Luxury Towel Set - Graphite Gray', 'images/products/luxury-towel-set.jpg', 3599, 4.5, 144),
('77919bbe-0e56-475b-adde-4f24dfed3a04', 'Round Sunglasses', 'images/products/round-sunglasses-gold.jpg', 1560, 4.5, 30),
('3fdfe8d6-9a15-4979-b459-585b0d0545b9', 'Women''s Knit Ballet Flat', 'images/products/women-knit-ballet-flat-white.jpg', 2640, 4.0, 326),
('58b4fc92-e98c-42aa-8c55-b6b79996769a', 'Men''s Athletic Shoes', 'images/products/men-athletic-shoes-white.jpg', 3390, 4.0, 229);

-- 插入关键词
INSERT INTO product_keywords (product_id, keyword) VALUES
('e43638ce-6aa0-4b85-b27f-e1d07eb678c6', 'socks'),
('e43638ce-6aa0-4b85-b27f-e1d07eb678c6', 'sports'),
('e43638ce-6aa0-4b85-b27f-e1d07eb678c6', 'apparel'),
('15b6fc6f-327a-4ec4-896f-486349e85a3d', 'sports'),
('15b6fc6f-327a-4ec4-896f-486349e85a3d', 'basketballs'),
('83d4ca15-0f35-48f5-b7a3-1ea210004f2e', 'tshirts'),
('83d4ca15-0f35-48f5-b7a3-1ea210004f2e', 'apparel'),
('83d4ca15-0f35-48f5-b7a3-1ea210004f2e', 'mens'),
('54e0eccd-8f36-462b-b68a-8182611d9add', 'toaster'),
('54e0eccd-8f36-462b-b68a-8182611d9add', 'appliances'),
('54e0eccd-8f36-462b-b68a-8182611d9add', 'kitchen'),
('3ebe75dc-64d2-4137-8860-1f5a963e534b', 'plates'),
('3ebe75dc-64d2-4137-8860-1f5a963e534b', 'kitchen'),
('3ebe75dc-64d2-4137-8860-1f5a963e534b', 'dining'),
('8c9c52b5-5a19-4bcb-a5d1-158a74287c53', 'sweaters'),
('8c9c52b5-5a19-4bcb-a5d1-158a74287c53', 'hoodies'),
('8c9c52b5-5a19-4bcb-a5d1-158a74287c53', 'apparel'),
('8c9c52b5-5a19-4bcb-a5d1-158a74287c53', 'mens'),
('dd82ca78-a18b-4e2a-9250-31e67412f98d', 'bathroom'),
('dd82ca78-a18b-4e2a-9250-31e67412f98d', 'home'),
('dd82ca78-a18b-4e2a-9250-31e67412f98d', 'towels'),
('77919bbe-0e56-475b-adde-4f24dfed3a04', 'sunglasses'),
('77919bbe-0e56-475b-adde-4f24dfed3a04', 'accessories'),
('3fdfe8d6-9a15-4979-b459-585b0d0545b9', 'shoes'),
('3fdfe8d6-9a15-4979-b459-585b0d0545b9', 'flats'),
('3fdfe8d6-9a15-4979-b459-585b0d0545b9', 'womens'),
('58b4fc92-e98c-42aa-8c55-b6b79996769a', 'shoes'),
('58b4fc92-e98c-42aa-8c55-b6b79996769a', 'running'),
('58b4fc92-e98c-42aa-8c55-b6b79996769a', 'athletic'),
('58b4fc92-e98c-42aa-8c55-b6b79996769a', 'mens');
```

---

## 项目结构

创建以下包结构：

```
backend-springboot/
└── src/
    └── main/
        ├── java/
        │   └── com/
        │       └── ecommerce/
        │           └── backend/
        │               ├── BackendApplication.java    # 主启动类
        │               ├── config/                     # 配置类
        │               │   └── CorsConfig.java
        │               ├── controller/                 # 控制器（API 端点）
        │               │   └── ProductController.java
        │               ├── dto/                        # 数据传输对象
        │               │   ├── ProductDTO.java
        │               │   └── RatingDTO.java
        │               ├── entity/                     # 实体类（对应数据库表）
        │               │   ├── Product.java
        │               │   └── ProductKeyword.java
        │               ├── repository/                 # 数据访问层
        │               │   ├── ProductRepository.java
        │               │   └── ProductKeywordRepository.java
        │               └── service/                    # 业务逻辑层
        │                   ├── ProductService.java
        │                   └── impl/
        │                       └── ProductServiceImpl.java
        └── resources/
            ├── application.properties  # 配置文件
            ├── schema.sql             # 建表脚本
            └── data.sql               # 初始化数据
```

---

## 编写后端代码

### 1. 配置 application.properties

编辑 `src/main/resources/application.properties`：

```properties
# 服务器配置
server.port=8080
spring.application.name=ecommerce-backend

# 数据库配置
spring.datasource.url=jdbc:mysql://localhost:3306/ecommerce?useSSL=false&serverTimezone=Asia/Shanghai&allowPublicKeyRetrieval=true
spring.datasource.username=root
spring.datasource.password=你的MySQL密码
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# JPA 配置
spring.jpa.hibernate.ddl-auto=none
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect

# 初始化数据库
spring.sql.init.mode=always
spring.sql.init.schema-locations=classpath:schema.sql
spring.sql.init.data-locations=classpath:data.sql
spring.sql.init.continue-on-error=false

# 日志配置
logging.level.com.ecommerce.backend=DEBUG
logging.level.org.springframework.web=INFO
```

**重要**：
- 将 `spring.datasource.password` 改为你的 MySQL 密码
- 如果使用 XAMPP，密码通常为空（直接删除这行）

### 2. 创建实体类 (Entity)

#### Product.java
创建 `src/main/java/com/ecommerce/backend/entity/Product.java`：

```java
package com.ecommerce.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Entity
@Table(name = "products")
public class Product {
    
    @Id
    @Column(length = 50)
    private String id;
    
    @Column(nullable = false)
    private String name;
    
    @Column(nullable = false, length = 500)
    private String image;
    
    @Column(name = "price_cents", nullable = false)
    private Integer priceCents;
    
    @Column(name = "rating_stars", nullable = false, precision = 2, scale = 1)
    private BigDecimal ratingStars = BigDecimal.ZERO;
    
    @Column(name = "rating_count", nullable = false)
    private Integer ratingCount = 0;
    
    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<ProductKeyword> keywords = new ArrayList<>();
    
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
```

#### ProductKeyword.java
创建 `src/main/java/com/ecommerce/backend/entity/ProductKeyword.java`：

```java
package com.ecommerce.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "product_keywords")
public class ProductKeyword {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    @JsonIgnore
    private Product product;
    
    @Column(nullable = false, length = 100)
    private String keyword;
}
```

### 3. 创建 DTO (Data Transfer Object)

#### RatingDTO.java
创建 `src/main/java/com/ecommerce/backend/dto/RatingDTO.java`：

```java
package com.ecommerce.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RatingDTO {
    private BigDecimal stars;
    private Integer count;
}
```

#### ProductDTO.java
创建 `src/main/java/com/ecommerce/backend/dto/ProductDTO.java`：

```java
package com.ecommerce.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductDTO {
    private String id;
    private String name;
    private String image;
    private Integer priceCents;
    private RatingDTO rating;
    private List<String> keywords;
}
```

### 4. 创建 Repository (数据访问层)

#### ProductRepository.java
创建 `src/main/java/com/ecommerce/backend/repository/ProductRepository.java`：

```java
package com.ecommerce.backend.repository;

import com.ecommerce.backend.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, String> {
    
    /**
     * 搜索商品（按名称或关键词）
     */
    @Query("SELECT DISTINCT p FROM Product p " +
           "LEFT JOIN p.keywords k " +
           "WHERE LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(k.keyword) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "ORDER BY p.ratingStars DESC, p.ratingCount DESC")
    List<Product> searchProducts(@Param("keyword") String keyword);
}
```

#### ProductKeywordRepository.java
创建 `src/main/java/com/ecommerce/backend/repository/ProductKeywordRepository.java`：

```java
package com.ecommerce.backend.repository;

import com.ecommerce.backend.entity.ProductKeyword;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductKeywordRepository extends JpaRepository<ProductKeyword, Integer> {
}
```

### 5. 创建 Service (业务逻辑层)

#### ProductService.java
创建 `src/main/java/com/ecommerce/backend/service/ProductService.java`：

```java
package com.ecommerce.backend.service;

import com.ecommerce.backend.dto.ProductDTO;
import java.util.List;

public interface ProductService {
    
    /**
     * 获取所有商品
     */
    List<ProductDTO> getAllProducts();
    
    /**
     * 根据 ID 获取商品
     */
    ProductDTO getProductById(String id);
    
    /**
     * 搜索商品
     */
    List<ProductDTO> searchProducts(String keyword);
}
```

#### ProductServiceImpl.java
创建 `src/main/java/com/ecommerce/backend/service/impl/ProductServiceImpl.java`：

```java
package com.ecommerce.backend.service.impl;

import com.ecommerce.backend.dto.ProductDTO;
import com.ecommerce.backend.dto.RatingDTO;
import com.ecommerce.backend.entity.Product;
import com.ecommerce.backend.entity.ProductKeyword;
import com.ecommerce.backend.repository.ProductRepository;
import com.ecommerce.backend.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProductServiceImpl implements ProductService {
    
    private final ProductRepository productRepository;
    
    @Override
    public List<ProductDTO> getAllProducts() {
        List<Product> products = productRepository.findAll();
        return products.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public ProductDTO getProductById(String id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
        return convertToDTO(product);
    }
    
    @Override
    public List<ProductDTO> searchProducts(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return getAllProducts();
        }
        
        List<Product> products = productRepository.searchProducts(keyword.trim());
        return products.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    /**
     * 将 Product 实体转换为 ProductDTO
     */
    private ProductDTO convertToDTO(Product product) {
        ProductDTO dto = new ProductDTO();
        dto.setId(product.getId());
        dto.setName(product.getName());
        dto.setImage(product.getImage());
        dto.setPriceCents(product.getPriceCents());
        
        // 设置评分
        RatingDTO rating = new RatingDTO(product.getRatingStars(), product.getRatingCount());
        dto.setRating(rating);
        
        // 设置关键词列表
        List<String> keywords = product.getKeywords().stream()
                .map(ProductKeyword::getKeyword)
                .collect(Collectors.toList());
        dto.setKeywords(keywords);
        
        return dto;
    }
}
```

### 6. 创建 Controller (控制器)

#### ProductController.java
创建 `src/main/java/com/ecommerce/backend/controller/ProductController.java`：

```java
package com.ecommerce.backend.controller;

import com.ecommerce.backend.dto.ProductDTO;
import com.ecommerce.backend.service.ProductService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {
    
    private final ProductService productService;
    
    /**
     * 获取所有商品
     * GET /api/products
     */
    @GetMapping
    public ResponseEntity<List<ProductDTO>> getAllProducts() {
        log.info("获取所有商品");
        List<ProductDTO> products = productService.getAllProducts();
        return ResponseEntity.ok(products);
    }
    
    /**
     * 根据 ID 获取商品
     * GET /api/products/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<ProductDTO> getProductById(@PathVariable String id) {
        log.info("获取商品详情, ID: {}", id);
        try {
            ProductDTO product = productService.getProductById(id);
            return ResponseEntity.ok(product);
        } catch (RuntimeException e) {
            log.error("商品不存在: {}", id);
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * 搜索商品
     * GET /api/products/search?q=keyword
     */
    @GetMapping("/search")
    public ResponseEntity<List<ProductDTO>> searchProducts(@RequestParam(required = false) String q) {
        log.info("搜索商品, 关键词: {}", q);
        List<ProductDTO> products = productService.searchProducts(q);
        return ResponseEntity.ok(products);
    }
}
```

### 7. 配置 CORS

创建 `src/main/java/com/ecommerce/backend/config/CorsConfig.java`：

```java
package com.ecommerce.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.Arrays;

@Configuration
public class CorsConfig {
    
    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration config = new CorsConfiguration();
        
        // 允许的前端地址
        config.setAllowedOrigins(Arrays.asList(
            "http://localhost:5173",  // Vite 开发服务器
            "http://localhost:3000"   // 其他可能的端口
        ));
        
        // 允许的 HTTP 方法
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        
        // 允许的请求头
        config.setAllowedHeaders(Arrays.asList("*"));
        
        // 允许发送 Cookie
        config.setAllowCredentials(true);
        
        // 预检请求的有效期（秒）
        config.setMaxAge(3600L);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", config);
        
        return new CorsFilter(source);
    }
}
```

---

## 测试接口

### 步骤 1：启动 Spring Boot 应用

#### 方法 A：在 IDEA 中运行
1. 打开 `BackendApplication.java`
2. 点击类名旁边的绿色运行按钮 ▶️
3. 选择 "Run 'BackendApplication'"

#### 方法 B：使用 Maven
```powershell
cd e:\react-course\ecommerce-project\backend-springboot
mvnw spring-boot:run
```

**启动成功标志**：
```
Started BackendApplication in X.XXX seconds
```

### 步骤 2：测试健康检查

创建一个简单的健康检查端点（可选）。

在 `ProductController.java` 添加：
```java
@GetMapping("/health")
public ResponseEntity<String> health() {
    return ResponseEntity.ok("Backend is running!");
}
```

浏览器访问：http://localhost:8080/api/products/health

### 步骤 3：测试 API

**使用浏览器**：

1. **获取所有商品**：http://localhost:8080/api/products
2. **搜索商品**：http://localhost:8080/api/products/search?q=shirt
3. **获取单个商品**：http://localhost:8080/api/products/e43638ce-6aa0-4b85-b27f-e1d07eb678c6

**使用 Postman**：

1. 创建新请求
2. 方法：GET
3. URL：`http://localhost:8080/api/products`
4. 点击 Send
5. 查看响应

---

## 连接前端

### 方法 1：使用 Vite 代理（推荐）

编辑 `ecommerce-project/vite.config.ts`：

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      }
    }
  }
})
```

### 方法 2：修改前端 API 配置

如果你的前端项目有 API 配置文件，修改为：

```typescript
// src/api/config.ts
export const API_BASE_URL = import.meta.env.DEV 
  ? 'http://localhost:8080'
  : '';
```

### 测试完整流程

1. **启动后端**（IntelliJ IDEA）
   - 端口：8080
   
2. **启动前端**（VS Code）
   ```powershell
   cd e:\react-course\ecommerce-project
   npm run dev
   ```
   - 端口：5173

3. **访问前端**：http://localhost:5173
4. **测试功能**：
   - 查看商品列表
   - 搜索商品
   - 点击商品查看详情

---

## 常见问题

### 问题 1：端口被占用

**错误**：
```
Web server failed to start. Port 8080 was already in use.
```

**解决方法**：
- 修改 `application.properties` 中的 `server.port=8081`
- 或关闭占用 8080 端口的程序

### 问题 2：数据库连接失败

**错误**：
```
Communications link failure
```

**解决方法**：
1. 确认 MySQL 服务已启动
2. 检查 `application.properties` 中的数据库配置
3. 验证用户名和密码
4. 添加 `allowPublicKeyRetrieval=true` 到 URL

### 问题 3：Lombok 不生效

**错误**：
```
Cannot resolve symbol 'getData'
```

**解决方法**：
1. 安装 Lombok 插件：
   - **File → Settings → Plugins**
   - 搜索 "Lombok"
   - 安装并重启 IDEA
2. 启用注解处理：
   - **File → Settings → Build → Compiler → Annotation Processors**
   - 勾选 "Enable annotation processing"

### 问题 4：CORS 错误

**错误（浏览器控制台）**：
```
Access to XMLHttpRequest has been blocked by CORS policy
```

**解决方法**：
- 确认 `CorsConfig.java` 已创建
- 检查 `allowedOrigins` 是否包含前端地址
- 重启 Spring Boot 应用

### 问题 5：SQL 初始化失败

**错误**：
```
Error executing DDL via JDBC Statement
```

**解决方法**：
1. 手动创建表：
   - 打开 phpMyAdmin
   - 选择 `ecommerce` 数据库
   - 执行 `schema.sql` 和 `data.sql`
2. 修改配置：
   ```properties
   spring.sql.init.mode=never
   ```

---

## 项目优化建议

### 1. 添加全局异常处理

创建 `src/main/java/com/ecommerce/backend/exception/GlobalExceptionHandler.java`：

```java
package com.ecommerce.backend.exception;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {
    
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, String>> handleRuntimeException(RuntimeException e) {
        log.error("Runtime exception: ", e);
        Map<String, String> error = new HashMap<>();
        error.put("error", e.getMessage());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }
    
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleException(Exception e) {
        log.error("Unexpected exception: ", e);
        Map<String, String> error = new HashMap<>();
        error.put("error", "Internal server error");
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }
}
```

### 2. 添加分页支持

修改 `ProductRepository.java`：

```java
Page<Product> findAll(Pageable pageable);
```

修改 `ProductService.java`：

```java
Page<ProductDTO> getAllProducts(int page, int size);
```

### 3. 添加缓存

在 `pom.xml` 添加依赖：

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-cache</artifactId>
</dependency>
```

在 `ProductServiceImpl.java` 添加缓存注解：

```java
@Cacheable("products")
public List<ProductDTO> getAllProducts() {
    // ...
}
```

---

## 总结

恭喜！🎉 你已经完成：

✅ 创建 Spring Boot 项目  
✅ 配置 MySQL 数据库  
✅ 实现 JPA 实体和关系映射  
✅ 创建 Repository、Service、Controller 三层架构  
✅ 实现商品列表、详情、搜索 API  
✅ 配置 CORS 支持前端调用  
✅ 测试所有接口  

**你学到的技能**：
- Spring Boot 框架
- Spring Data JPA
- RESTful API 设计
- 三层架构（Controller-Service-Repository）
- MySQL 数据库操作
- Lombok 简化代码
- CORS 配置

**下一步**：
- 实现购物车功能
- 实现订单功能
- 添加用户认证（Spring Security + JWT）
- 部署到云服务器

需要帮助随时问我！💪
