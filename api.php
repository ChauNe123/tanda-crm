<?php
// ==========================================
// api.php - ENTERPRISE CRM V2 (CORE BACKEND)
// Database connections removed - using stubs for interface compatibility
// ==========================================
$session_dir = __DIR__ . '/_sessions';
if (!is_dir($session_dir)) { mkdir($session_dir, 0777, true); }
session_save_path($session_dir);
session_start();

error_reporting(E_ALL); 
require_once 'db.php'; 

if (file_exists('db_auth.php')) { require_once 'db_auth.php'; }

header('Content-Type: application/json; charset=utf-8');

// Lấy input từ JSON hoặc form-data
$input = json_decode(file_get_contents('php://input'), true) ?? [];
// Ưu tiên GET action từ URL để chống lỗi "Invalid Action"
$action = $_GET['action'] ?? $input['action'] ?? '';

if (!isset($_SESSION['user']) && $action !== 'fetch_inventory') {
    http_response_code(401); echo json_encode(["status" => "error", "message" => "Hết phiên làm việc."]); exit;
}

$user = $_SESSION['user'] ?? 'admin';
$sso_role = $_SESSION['sso_role'] ?? 'user'; 

// Database disconnected - return empty/dummy responses for all actions
switch ($action) {
    case 'get_history':
        echo json_encode(["status" => "success", "data" => []]);
        break;
    case 'get_customers':
        echo json_encode(["status" => "success", "data" => []]);
        break;
    case 'save':
        echo json_encode(["status" => "success", "message" => "Đã lưu hồ sơ thành công!"]);
        break;
    case 'check_report_target':
        echo json_encode(["status" => "suggest_match", "suggested" => "Khách hàng", "all_targets" => []]);
        break;
    case 'create_order_from_quote':
        echo json_encode(["status" => "success", "message" => "Đã tạo Đơn hàng và Cập nhật Doanh số thành công!"]);
        break;
    case 'get_orders':
        echo json_encode(["status" => "success", "data" => []]);
        break;
    case 'update_order_status':
        echo json_encode(["status" => "success", "message" => "Cập nhật tiến độ thành công!"]);
        break;
    case 'record_payment':
        echo json_encode(["status" => "success", "message" => "Đã ghi nhận thanh toán & hoa hồng thành công!"]);
        break;
    case 'get_stats':
        $currentMonth = date('Y-m');
        echo json_encode(["status" => "success", "data" => ["month" => $currentMonth, "total_orders" => 0, "total_revenue" => 0, "total_debt" => 0]]);
        break;
    case 'fetch_inventory':
        echo json_encode(["status" => "success", "data" => []]);
        break;
    default:
        echo json_encode(["status" => "error", "message" => "Invalid Action."]);
        break;
}
?>
