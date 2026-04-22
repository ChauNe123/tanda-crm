<?php
// ==========================================
// TANDA CRM - DATABASE CONNECTION
// ==========================================
error_reporting(E_ALL);
ini_set('display_errors', 1);

$host = 'localhost';
$db   = 'tanda_quotes_db'; // DB mới của bạn
$user = 'root';            // Tài khoản MySQL của bạn
$pass = '0705.KenBen';                // Mật khẩu MySQL của bạn

$dsn = "mysql:host=$host;dbname=$db;charset=utf8mb4";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
    $pdo = new PDO($dsn, $user, $pass, $options);
} catch (\PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Lỗi kết nối CSDL TANDA: " . $e->getMessage()]);
    exit;
}
?>