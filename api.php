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
            // TỐI ƯU MỚI: Thêm Subquery kiểm tra xem Báo giá đã được chốt thành Đơn hàng chưa
            if ($sso_role === 'admin') {
                $sql = "SELECT q.*, 
                        (SELECT COUNT(id) FROM orders o WHERE o.quote_id = q.id) as is_converted 
                        FROM quotes q 
                        ORDER BY q.doc_date DESC, q.id DESC LIMIT 100";
                $stmt = $pdo->query($sql);
            } else {
                $sql = "SELECT q.*, 
                        (SELECT COUNT(id) FROM orders o WHERE o.quote_id = q.id) as is_converted 
                        FROM quotes q 
                        WHERE q.created_by = ? 
                        ORDER BY q.doc_date DESC, q.id DESC LIMIT 50";
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

    // ================= 2. BỘ LỌC AI & DOANH THU =================
    case 'check_report_target':
        try {
            $rawName = $input['company_name'] ?? '';
            $stmtMap = $pdo->prepare("SELECT target_name FROM customer_mapping WHERE raw_name = ?");
            $stmtMap->execute([$rawName]);
            $mapped = $stmtMap->fetchColumn();

            $allTargets = [];
            try { $allTargets = $pdo->query("SELECT DISTINCT target FROM kb_report.reports WHERE target IS NOT NULL AND target != '' ORDER BY target ASC")->fetchAll(PDO::FETCH_COLUMN); } catch (Exception $e) {}

            if ($mapped) { echo json_encode(["status" => "exact_match", "target" => $mapped]); exit; }

            $stopwords = ['công ty', 'cổ phần', 'cp', 'tnhh', 'mtv', 'tm', 'dv', 'thương mại', 'dịch vụ', 'tập đoàn', 'chi nhánh', 'sản xuất', 'xuất nhập khẩu', 'xnk', 'đầu tư', 'phát triển', 'giải pháp', 'thiết kế', 'xây dựng', 'quốc tế'];
            $cleanName = mb_strtolower($rawName, 'UTF-8');
            foreach ($stopwords as $word) { $cleanName = preg_replace('/\b' . preg_quote($word, '/') . '\b/ui', '', $cleanName); }
            $cleanName = trim(preg_replace('/\s+/', ' ', str_replace(['-', ',', '.', '(', ')'], ' ', $cleanName)));
            $cleanName = mb_convert_case($cleanName, MB_CASE_TITLE, "UTF-8");

            $suggested = $cleanName; 
            foreach ($allTargets as $t) {
                if (stripos($t, $cleanName) !== false || stripos($cleanName, $t) !== false) { $suggested = $t; break; }
            }
            echo json_encode(["status" => "suggest_match", "suggested" => $suggested, "all_targets" => $allTargets]);
        } catch (Exception $e) { echo json_encode(["status" => "error"]); }
        break;

    // ================= 3. ĐƠN HÀNG KANBAN =================
    case 'create_order_from_quote':
        try {
            $quoteId = $input['quote_id'] ?? '';
            $reportTarget = $input['report_target'] ?? '';
            $agentName = $input['agent_name'] ?? $user; 

            $stmt = $pdo->prepare("SELECT * FROM quotes WHERE id = ?");
            $stmt->execute([$quoteId]);
            $quote = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$quote) { echo json_encode(["status" => "error", "message" => "Không tìm thấy báo giá."]); exit; }

            $orderNo = str_replace('KB', 'ORD', $quote['quote_no']); 
            $totalAmount = floatval($quote['total_amount'] ?? 0);
            $validDate = !empty($quote['doc_date']) ? $quote['doc_date'] : date('Y-m-d');
            
            $pdo->beginTransaction();

            $sql = "INSERT INTO orders (order_no, quote_id, doc_date, customer_name, total_amount, status, payment_status, paid_amount, products_json, created_by) VALUES (?, ?, ?, ?, ?, 'pending', 'unpaid', 0, ?, ?)";
            $pdo->prepare($sql)->execute([$orderNo, $quoteId, $validDate, $quote['buyer_name'], $totalAmount, $quote['products_json'], $quote['created_by']]);
            $orderId = $pdo->lastInsertId();
            
            $pdo->prepare("INSERT INTO order_logs (order_id, action, user) VALUES (?, 'Chốt Báo giá thành Đơn hàng', ?)")->execute([$orderId, $user]);

            if (!empty($reportTarget)) {
                if (stripos($reportTarget, 'khách hàng lẻ') === false) {
                    $stmtMap = $pdo->prepare("INSERT IGNORE INTO customer_mapping (raw_name, target_name) VALUES (?, ?) ON DUPLICATE KEY UPDATE target_name = VALUES(target_name)");
                    $stmtMap->execute([$quote['buyer_name'], $reportTarget]);
                }
                $details = !empty($quote['project_name']) ? trim($quote['project_name']) : 'Không có tên dự án';
                $reportDateFormatted = date('n/j/Y', strtotime($validDate));

                $stmtReport = $pdo->prepare("INSERT INTO kb_report.reports (target, details, timestamp, agent, value) VALUES (?, ?, ?, ?, ?)");
                $stmtReport->execute([$reportTarget, $details, $reportDateFormatted, $agentName, $totalAmount]);
            }
            $pdo->commit();
            echo json_encode(["status" => "success", "message" => "Đã tạo Đơn hàng và Cập nhật Doanh số thành công!"]);
        } catch (PDOException $e) {
            $pdo->rollBack();
            if ($e->getCode() == 23000) echo json_encode(["status" => "error", "message" => "Đơn hàng này đã được chốt rồi!"]);
            else echo json_encode(["status" => "error", "message" => "Lỗi DB: " . $e->getMessage()]);
        }
        break;

    case 'get_orders':
        try {
            if ($sso_role === 'admin') {
                $stmt = $pdo->query("SELECT * FROM orders ORDER BY id DESC LIMIT 200");
            } else {
                $stmt = $pdo->prepare("SELECT * FROM orders WHERE created_by = ? ORDER BY id DESC LIMIT 200");
                $stmt->execute([$user]);
            }
            echo json_encode(["status" => "success", "data" => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
        } catch (Exception $e) { echo json_encode(["status" => "error"]); }
        break;

    case 'update_order_status':
        try {
            $orderId = $input['order_id']; $newStatus = $input['status']; $note = $input['note'] ?? '';
            $pdo->prepare("UPDATE orders SET status = ? WHERE id = ?")->execute([$newStatus, $orderId]);
            $actionText = "Đổi trạng thái: " . strtoupper($newStatus);
            if ($newStatus == 'exported') $actionText = "Đang triển khai / Giao hàng";
            if ($newStatus == 'completed') $actionText = "Hoàn tất bàn giao";
            $pdo->prepare("INSERT INTO order_logs (order_id, action, notes, user) VALUES (?, ?, ?, ?)")->execute([$orderId, $actionText, $note, $user]);
            echo json_encode(["status" => "success", "message" => "Cập nhật tiến độ thành công!"]);
        } catch (Exception $e) { echo json_encode(["status" => "error"]); }
        break;

    // ================= 4. QUẢN LÝ THU TIỀN TỪNG PHẦN & HOA HỒNG =================
    case 'record_payment':
        // Gắn thẳng data vì đã đọc từ $input phía trên
        $order_id = $input['order_id'] ?? 0;
        $amount = (float)($input['amount'] ?? 0);
        $commission = (float)($input['commission'] ?? 0);
        $project_name = $input['project_name'] ?? 'Hoa hồng dự án';

        try {
            // Bật bắt lỗi nghiêm ngặt cho PDO
            $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $pdo->beginTransaction();

            // 1. Cập nhật tiền nợ trong CRM (Cả orders và quotes)
            $stmt = $pdo->prepare("UPDATE orders SET paid_amount = paid_amount + ?, payment_status = CASE WHEN (paid_amount + ?) >= total_amount THEN 'paid' ELSE 'partial' END WHERE id = ?");
            $stmt->execute([$amount, $amount, $order_id]);
            
            $pdo->prepare("UPDATE quotes SET paid_amount = paid_amount + ?, payment_status = CASE WHEN (paid_amount + ?) >= total_amount THEN 'paid' ELSE 'partial' END WHERE id = (SELECT quote_id FROM orders WHERE id = ?)")->execute([$amount, $amount, $order_id]);

            // Ghi Log vào CRM
            $logMsg = "Kế toán đã thu: " . number_format($amount, 0, ',', '.') . " đ.";
            $pdo->prepare("INSERT INTO order_logs (order_id, action, user) VALUES (?, ?, ?)")->execute([$order_id, $logMsg, $user]);

            // 2. Ghi nhận Hoa hồng sang db kb_salary (Nếu có)
            if ($commission > 0) {
                // Lấy user Sale tạo đơn
                $stmtSale = $pdo->prepare("SELECT q.created_by FROM orders o LEFT JOIN quotes q ON o.quote_id = q.id WHERE o.id = ?");
                $stmtSale->execute([$order_id]);
                $sale_user = $stmtSale->fetchColumn();

                // Nếu vì lý do nào đó đơn này mất tên người tạo, gán tạm cho admin để không bị mất tiền
                if (!$sale_user || empty($sale_user)) {
                    $sale_user = 'admin'; 
                }

                $adj_date = date('Y-m-d');
                $adj_month = date('Y-m'); // Format YYYY-MM cho db kb_salary

                // Insert chéo vào db lương
                $sqlSalary = "INSERT INTO kb_salary.adjustment_logs (username, adj_date, adj_month, adj_type, amount, note, created_at) 
                              VALUES (?, ?, ?, 'commission', ?, ?, NOW())";
                $stmtSal = $pdo->prepare($sqlSalary);
                $stmtSal->execute([$sale_user, $adj_date, $adj_month, $commission, "Hoa hồng CRM: " . $project_name]);
            }

            $pdo->commit();
            echo json_encode(["status" => "success", "message" => "Đã ghi nhận thanh toán & hoa hồng thành công!"]);
        } catch (Exception $e) {
            if ($pdo->inTransaction()) {
                $pdo->rollBack();
            }
            // Nếu báo lỗi này thì 100% là User DB của CRM chưa được cấp quyền truy cập INSERT vào DB kb_salary
            echo json_encode(["status" => "error", "message" => "Lỗi SQL: " . $e->getMessage()]);
        }
        break;

    // ================= 5. THỐNG KÊ (TỐI ƯU HIỆU NĂNG) =================
    case 'get_stats':
        try {
            $currentMonth = date('Y-m');
            $startDate = $currentMonth . '-01'; 
            $endDate = date('Y-m-d', strtotime("$startDate +1 month")); 

            if ($sso_role === 'admin') {
                $sqlMonth = "SELECT COUNT(*) as total_orders, SUM(total_amount) as total_revenue 
                             FROM quotes 
                             WHERE doc_date >= '$startDate' AND doc_date < '$endDate' AND status != 'cancelled'";
                $monthStats = $pdo->query($sqlMonth)->fetch();
                
                $debtStats = $pdo->query("SELECT SUM(total_amount - paid_amount) as total_debt FROM quotes WHERE payment_status != 'paid' AND status != 'cancelled'")->fetch();
            } else {
                $stmt = $pdo->prepare("SELECT COUNT(*) as total_orders, SUM(total_amount) as total_revenue 
                                       FROM quotes 
                                       WHERE doc_date >= ? AND doc_date < ? AND created_by = ? AND status != 'cancelled'");
                $stmt->execute([$startDate, $endDate, $user]); 
                $monthStats = $stmt->fetch();
                
                $stmtDebt = $pdo->prepare("SELECT SUM(total_amount - paid_amount) as total_debt FROM quotes WHERE payment_status != 'paid' AND created_by = ? AND status != 'cancelled'");
                $stmtDebt->execute([$user]); 
                $debtStats = $stmtDebt->fetch();
            }
            echo json_encode(["status" => "success", "data" => ["month" => $currentMonth, "total_orders" => $monthStats['total_orders'] ?? 0, "total_revenue" => $monthStats['total_revenue'] ?? 0, "total_debt" => $debtStats['total_debt'] ?? 0]]);
        } catch (Exception $e) { echo json_encode(["status" => "error"]); }
        break;

    default:
        echo json_encode(["status" => "error", "message" => "Invalid Action."]);
        break;
}
?>