<?php
session_start();
header('Content-Type: application/json; charset=utf-8');

$db = new PDO("mysql:host=localhost;dbname=tanda_quotes_db;charset=utf8mb4", "root", "0705.KenBen");

$input = json_decode(file_get_contents('php://input'), true) ?? [];
$action = $_GET['action'] ?? $input['action'] ?? '';

if (!isset($_SESSION['user']) && $action !== 'login') {
    echo json_encode(["status" => "error", "message" => "Unauthorized"]); exit;
}

switch ($action) {
    case 'login':
        $u = $input['username'] ?? '';
        $p = $input['password'] ?? '';
        $stmt = $db->prepare("SELECT * FROM users WHERE username = ?");
        $stmt->execute([$u]);
        $user = $stmt->fetch();
        // Giả lập check pass đơn giản cho admin/123
        if ($user && ($p === '123' || password_verify($p, $user['password']))) {
            $_SESSION['user'] = $u;
            echo json_encode(["status" => "success", "user" => $u]);
        } else {
            echo json_encode(["status" => "error", "message" => "Sai tài khoản hoặc mật khẩu"]);
        }
        break;

    case 'save':
        $sql = "INSERT INTO quotes (quote_no, doc_date, project_name, buyer_name, buyer_address, buyer_tax, buyer_phone, total_amount, products_json, created_by) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE project_name=VALUES(project_name), total_amount=VALUES(total_amount), products_json=VALUES(products_json)";
        $stmt = $db->prepare($sql);
        $stmt->execute([
            $input['quote_no'], $input['doc_date'], $input['project_name'], 
            $input['buyer_name'], $input['buyer_address'], $input['buyer_tax'], 
            $input['buyer_phone'], $input['total_amount'], $input['products_json'], $_SESSION['user']
        ]);
        echo json_encode(["status" => "success", "message" => "Đã lưu báo giá TANDA!"]);
        break;

    case 'get_history':
        $stmt = $db->query("SELECT * FROM quotes ORDER BY id DESC");
        echo json_encode(["status" => "success", "data" => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
        break;
}
?>