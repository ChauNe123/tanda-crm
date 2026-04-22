<?php
// ==========================================
// TANDA CRM - CORE BACKEND (STANDALONE)
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

if (!isset($_SESSION['user']) && $action !== 'fetch_inventory') {
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

    case 'create_order_from_quote':
        try {
            $pdo->beginTransaction();
            $quoteId = $input['quote_id'];
            
            // Fetch Quote Info
            $stmt = $pdo->prepare("SELECT * FROM quotes WHERE id = ?");
            $stmt->execute([$quoteId]);
            $quote = $stmt->fetch();

            if($quote) {
                $orderNo = str_replace('KB', 'ORD', $quote['quote_no']); // Đổi tiền tố nếu muốn
                
                $stmt = $pdo->prepare("INSERT INTO orders (order_no, order_type, quote_id, doc_date, customer_name, staff_name, total_amount, products_json, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
                $stmt->execute([$orderNo, $quote['order_type'], $quote['id'], date('Y-m-d'), $quote['buyer_name'], $quote['staff_name'], $quote['total_amount'], $quote['products_json'], $user]);
                
                $newOrderId = $pdo->lastInsertId();

                // Ghi Log
                $logStmt = $pdo->prepare("INSERT INTO order_logs (order_id, action, user) VALUES (?, 'Chốt Báo giá thành Đơn hàng', ?)");
                $logStmt->execute([$newOrderId, $user]);
            }
            $pdo->commit();
            echo json_encode(["status" => "success", "message" => "Đã tạo Đơn hàng thành công!"]);
        } catch (Exception $e) {
            $pdo->rollBack();
            echo json_encode(["status" => "error", "message" => "Lỗi: " . $e->getMessage()]);
        }
        break;

    case 'get_orders':
        $stmt = $pdo->query("SELECT * FROM orders ORDER BY id DESC LIMIT 100");
        echo json_encode(["status" => "success", "data" => $stmt->fetchAll()]);
        break;

    case 'update_order_status':
        $stmt = $pdo->prepare("UPDATE orders SET status = ? WHERE id = ?");
        $stmt->execute([$input['status'], $input['order_id']]);
        
        $logStmt = $pdo->prepare("INSERT INTO order_logs (order_id, action, notes, user) VALUES (?, ?, ?, ?)");
        $logStmt->execute([$input['order_id'], "Cập nhật trạng thái: " . $input['status'], $input['notes'] ?? '', $user]);
        
        echo json_encode(["status" => "success", "message" => "Cập nhật tiến độ thành công!"]);
        break;

    case 'record_payment':
        try {
            $pdo->beginTransaction();
            $orderId = $input['order_id'];
            $amount = $input['amount'];

            // Lấy thông tin đơn hàng
            $stmt = $pdo->prepare("SELECT total_amount, paid_amount FROM orders WHERE id = ?");
            $stmt->execute([$orderId]);
            $order = $stmt->fetch();

            $newPaid = $order['paid_amount'] + $amount;
            $payStatus = ($newPaid >= $order['total_amount']) ? 'paid' : 'partial';

            $updateOrder = $pdo->prepare("UPDATE orders SET paid_amount = ?, payment_status = ? WHERE id = ?");
            $updateOrder->execute([$newPaid, $payStatus, $orderId]);

            // Ghi log thu tiền
            $logStmt = $pdo->prepare("INSERT INTO order_logs (order_id, action, user) VALUES (?, ?, ?)");
            $logStmt->execute([$orderId, "Kế toán đã thu: " . number_format($amount) . " đ", $user]);

            // BỎ HOÀN TOÀN TÍNH NĂNG CHIA HOA HỒNG SANG KB_SALARY. Không còn Cross-DB.

            $pdo->commit();
            echo json_encode(["status" => "success", "message" => "Đã ghi nhận thanh toán thành công!"]);
        } catch (Exception $e) {
            $pdo->rollBack();
            echo json_encode(["status" => "error", "message" => "Lỗi: " . $e->getMessage()]);
        }
        break;

    case 'get_stats':
        $currentMonth = date('Y-m');
        $stmt = $pdo->prepare("SELECT COUNT(*) as total_orders, SUM(total_amount) as total_revenue, SUM(total_amount - paid_amount) as total_debt FROM orders WHERE DATE_FORMAT(doc_date, '%Y-%m') = ?");
        $stmt->execute([$currentMonth]);
        $stats = $stmt->fetch();
        
        echo json_encode(["status" => "success", "data" => [
            "month" => $currentMonth, 
            "total_orders" => $stats['total_orders'] ?? 0, 
            "total_revenue" => $stats['total_revenue'] ?? 0, 
            "total_debt" => $stats['total_debt'] ?? 0
        ]]);
        break;

    case 'fetch_inventory':
        // Cắt bỏ API proxy nội bộ cũ. Trả về rỗng để Frontend cho phép gõ tự do.
        echo json_encode(["status" => "success", "data" => []]);
        break;

    default:
        echo json_encode(["status" => "error", "message" => "Invalid Action."]);
        break;
}
?>