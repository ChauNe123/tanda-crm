<?php
// ==========================================
// api.php - ENTERPRISE CRM V2 (CORE BACKEND)
// Tích hợp: AI Target, Kanban, Quản lý Công nợ kép & Hoa hồng tự động
// Phiên bản: Tối ưu hoá 100%
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

switch ($action) {

    // ================= 1. HỒ SƠ & KHÁCH HÀNG =================
    case 'get_history':
        try {
            if ($sso_role === 'admin') {
                $sql = "SELECT q.* FROM quotes q ORDER BY q.doc_date DESC, q.id DESC LIMIT 100";
                $stmt = $pdo->query($sql);
            } else {
                $sql = "SELECT q.* FROM quotes q WHERE q.created_by = ? ORDER BY q.doc_date DESC, q.id DESC LIMIT 50";
                $stmt = $pdo->prepare($sql);
                $stmt->execute([$user]);
            }
            echo json_encode(["status" => "success", "data" => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
        } catch (Exception $e) { echo json_encode(["status" => "error", "message" => $e->getMessage()]); }
        break;

    case 'get_customers':
        try {
            $stmt = $pdo->query("SELECT * FROM customers ORDER BY company_name ASC LIMIT 500");
            echo json_encode(["status" => "success", "data" => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
        } catch (Exception $e) { echo json_encode(["status" => "error"]); }
        break;

    case 'save':
        try {
            $quoteNo        = $input['quote_no'] ?? '';
            $docDate        = !empty($input['doc_date']) ? $input['doc_date'] : date('Y-m-d');
            $contractNo     = $input['contract_no'] ?? '';
            $projectName    = $input['project_name'] ?? '';
            $buyerName      = $input['buyer_name'] ?? '';
            $buyerAddress   = $input['buyer_address'] ?? '';
            $deliveryAddress= $input['delivery_address'] ?? '';
            $buyerTax       = $input['buyer_tax'] ?? '';
            $buyerPhone     = $input['buyer_phone'] ?? '';
            $buyerRep       = $input['buyer_rep'] ?? ''; 
            $buyerRole      = $input['buyer_role'] ?? '';
            $paymentOpt     = $input['payment_opt'] ?? '100';
            $productsJson   = $input['products_json'] ?? '[]';
            
            $docType        = $input['doc_type'] ?? 'commercial';
            $totalAmount    = floatval($input['total_amount'] ?? 0);
            $createdBy      = !empty($input['staff_username']) ? $input['staff_username'] : (!empty($input['created_by']) ? $input['created_by'] : $user);

            if (empty($quoteNo)) { echo json_encode(["status" => "error", "message" => "Thiếu mã báo giá!"]); exit; }

            $sql = "INSERT INTO quotes 
                    (quote_no, doc_date, contract_no, project_name, buyer_name, buyer_address, delivery_address, buyer_tax, buyer_phone, buyer_rep, buyer_role, payment_opt, products_json, created_by, doc_type, total_amount, status, payment_status, paid_amount) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'approved', 'unpaid', 0)
                    ON DUPLICATE KEY UPDATE 
                    doc_date=VALUES(doc_date), contract_no=VALUES(contract_no), project_name=VALUES(project_name), 
                    buyer_name=VALUES(buyer_name), buyer_address=VALUES(buyer_address), delivery_address=VALUES(delivery_address), 
                    buyer_tax=VALUES(buyer_tax), buyer_phone=VALUES(buyer_phone), buyer_rep=VALUES(buyer_rep), 
                    buyer_role=VALUES(buyer_role), payment_opt=VALUES(payment_opt), products_json=VALUES(products_json),
                    created_by=VALUES(created_by), doc_type=VALUES(doc_type), total_amount=VALUES(total_amount)";
            
            $stmt = $pdo->prepare($sql);
            $stmt->execute([$quoteNo, $docDate, $contractNo, $projectName, $buyerName, $buyerAddress, $deliveryAddress, $buyerTax, $buyerPhone, $buyerRep, $buyerRole, $paymentOpt, $productsJson, $createdBy, $docType, $totalAmount]);

            if (!empty($buyerName) && stripos($buyerName, 'Khách hàng lẻ') === false) {
                $sqlCust = "INSERT INTO customers (company_name, tax_code, address, phone, representative, role) VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE tax_code=VALUES(tax_code), address=VALUES(address), phone=VALUES(phone), representative=VALUES(representative), role=VALUES(role)";
                $pdo->prepare($sqlCust)->execute([$buyerName, $buyerTax, $buyerAddress, $buyerPhone, $buyerRep, $buyerRole]);
            }
            echo json_encode(["status" => "success", "message" => "Đã lưu hồ sơ thành công!"]);
        } catch (Exception $e) { echo json_encode(["status" => "error", "message" => "Lỗi DB: " . $e->getMessage()]); }
        break;

    default:
        echo json_encode(["status" => "error", "message" => "Invalid Action."]);
        break;
}
?>