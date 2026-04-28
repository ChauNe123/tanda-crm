<?php
// ==========================================
// TANDA CRM - QUOTATION API (Simplified)
// ==========================================
$session_dir = __DIR__ . '/_sessions';
if (!is_dir($session_dir)) { mkdir($session_dir, 0777, true); }
session_save_path($session_dir);
session_start();

error_reporting(E_ALL); 
require_once 'db.php'; 

header('Content-Type: application/json; charset=utf-8');

$input = json_decode(file_get_contents('php://input'), true) ?? [];
$action = $_GET['action'] ?? $input['action'] ?? '';

if (!isset($_SESSION['user'])) {
    http_response_code(401); 
    echo json_encode(["status" => "error", "message" => "Hết phiên làm việc."]); 
    exit;
}

$user = $_SESSION['user'] ?? 'admin';

switch ($action) {
    case 'save':
        try {
            $pdo->beginTransaction();
            
            // 1. Lưu Khách Hàng (Tự động Update nếu trùng tên)
            if(!empty($input['buyerName'])) {
                $stmt = $pdo->prepare("INSERT INTO customers (company_name, tax_code, address, phone, representative, role) VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE tax_code=VALUES(tax_code), address=VALUES(address), phone=VALUES(phone), representative=VALUES(representative)");
                $stmt->execute([$input['buyerName'], $input['buyerTax'], $input['buyerAddress'], $input['buyerPhone'], $input['buyerRep'], $input['buyerRole']]);
            }

            // 2. Lưu Báo Giá
            $products_json = json_encode($input['products'], JSON_UNESCAPED_UNICODE);
            $stmt = $pdo->prepare("INSERT INTO quotes (quote_no, order_type, doc_date, contract_no, project_name, staff_name, buyer_name, buyer_address, delivery_address, buyer_tax, buyer_phone, buyer_rep, buyer_role, doc_type, total_amount, payment_opt, products_json, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE doc_date=VALUES(doc_date), project_name=VALUES(project_name), buyer_name=VALUES(buyer_name), total_amount=VALUES(total_amount), products_json=VALUES(products_json)");
            
            $stmt->execute([
                $input['quoteNo'], $input['docType'], $input['docDate'], $input['contractNo'], 
                $input['projectName'], $input['assignedStaff'], $input['buyerName'], 
                $input['buyerAddress'], $input['deliveryAddress'], $input['buyerTax'], 
                $input['buyerPhone'], $input['buyerRep'], $input['buyerRole'], 
                $input['docType'], $input['totalAmount'], $input['paymentOpt'], 
                $products_json, $user
            ]);

            $pdo->commit();
            echo json_encode(["status" => "success", "message" => "Đã lưu Báo giá thành công vào hệ thống TANDA!"]);
        } catch (Exception $e) {
            $pdo->rollBack();
            echo json_encode(["status" => "error", "message" => "Lỗi: " . $e->getMessage()]);
        }
        break;

    case 'get_history':
        $stmt = $pdo->query("SELECT * FROM quotes ORDER BY id DESC LIMIT 50");
        echo json_encode(["status" => "success", "data" => $stmt->fetchAll()]);
        break;

    case 'get_customers':
        $stmt = $pdo->query("SELECT * FROM customers ORDER BY company_name ASC");
        echo json_encode(["status" => "success", "data" => $stmt->fetchAll()]);
        break;

    default:
        echo json_encode(["status" => "error", "message" => "Invalid Action."]);
        break;
}
?>