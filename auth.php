<?php
$session_dir = __DIR__ . '/_sessions';
if (!is_dir($session_dir)) { mkdir($session_dir, 0700, true); }
ini_set('session.use_only_cookies', 1);
ini_set('session.cookie_httponly', 1);
session_save_path($session_dir);
session_start();

require_once 'db.php'; // Chỉ gọi db.php

function sendJson($data) {
    if (ob_get_length()) ob_clean();
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data);
    exit;
}

$action = $_GET['action'] ?? '';

if ($action === 'check') {
    if (isset($_SESSION['user'])) {
        sendJson([
            "status" => "logged_in", 
            "user" => $_SESSION['user'],
            "role" => $_SESSION['role']
        ]);
    } else {
        sendJson(["status" => "logged_out"]);
    }
}

if ($action === 'logout') {
    $_SESSION = array();
    session_destroy();
    sendJson(["status" => "success", "message" => "Đã đăng xuất khỏi TANDA CRM"]);
}

$input = json_decode(file_get_contents('php://input'), true);
if ($input) {
    $user = trim($input['username'] ?? '');
    $pass = $input['password'] ?? '';

    if (empty($user) || empty($pass)) {
        sendJson(["status" => "error", "message" => "Vui lòng nhập đầy đủ thông tin."]);
    }

    // Check DB
    $stmt = $pdo->prepare("SELECT * FROM users WHERE username = ?");
    $stmt->execute([$user]);
    $dbUser = $stmt->fetch();

    if ($dbUser && password_verify($pass, $dbUser['password'])) {
        session_regenerate_id(true);
        $_SESSION['user'] = $dbUser['username'];
        $_SESSION['role'] = $dbUser['role'];

        sendJson([
            "status" => "success", 
            "user" => $_SESSION['user'],
            "role" => $_SESSION['role']
        ]);
    } else {
        sendJson(["status" => "error", "message" => "Tài khoản hoặc mật khẩu không chính xác."]);
    }
}
?>