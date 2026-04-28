-- ==========================================
-- TANDA CRM - SETUP DATABASE
-- ==========================================

-- 1. Tạo Database
CREATE DATABASE IF NOT EXISTS tanda_quotes_db;
USE tanda_quotes_db;

-- 2. Bảng Users (Tài khoản đăng nhập)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    email VARCHAR(100),
    phone VARCHAR(20),
    role VARCHAR(50) DEFAULT 'staff',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Bảng Customers (Khách hàng)
CREATE TABLE IF NOT EXISTS customers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_name VARCHAR(200) UNIQUE NOT NULL,
    tax_code VARCHAR(50),
    address TEXT,
    phone VARCHAR(20),
    representative VARCHAR(100),
    role VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Bảng Quotes (Báo giá)
CREATE TABLE IF NOT EXISTS quotes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    quote_no VARCHAR(50) UNIQUE NOT NULL,
    order_type VARCHAR(50),
    doc_date DATE,
    contract_no VARCHAR(50),
    project_name VARCHAR(200),
    staff_name VARCHAR(100),
    buyer_name VARCHAR(200),
    buyer_address TEXT,
    delivery_address TEXT,
    buyer_tax VARCHAR(50),
    buyer_phone VARCHAR(20),
    buyer_rep VARCHAR(100),
    buyer_role VARCHAR(100),
    doc_type VARCHAR(50),
    total_amount BIGINT DEFAULT 0,
    payment_opt VARCHAR(50),
    products_json LONGTEXT,
    created_by VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ==========================================
-- TẠO TÀI KHOẢN DEMO
-- ==========================================

-- Tài khoản admin: 
-- Username: admin
-- Password: 123456
INSERT INTO users (username, password, full_name, email, phone, role) VALUES 
('admin', '$2y$10$YIjlrTyWFqVTZ8/LewKh2OPST9/PgBkqx8ykCWH.d6KuVVV7/.mPm', 'Quản Trị Viên', 'admin@tanda.vn', '0933129155', 'admin');

-- Tài khoản staff demo:
-- Username: tuanhai
-- Password: 123456
INSERT INTO users (username, password, full_name, email, phone, role) VALUES 
('tuanhai', '$2y$10$YIjlrTyWFqVTZ8/LewKh2OPST9/PgBkqx8ykCWH.d6KuVVV7/.mPm', 'Lê Tuấn Hải', 'tuanhai@tanda.vn', '0933129155', 'staff');

-- ==========================================
-- DONE!
-- ==========================================
-- Hãy import file này vào MySQL để setup database
-- Sau đó đăng nhập với:
-- Username: admin | Password: 123456
-- hoặc
-- Username: tuanhai | Password: 123456
