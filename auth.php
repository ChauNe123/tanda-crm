<?php
$session_dir = __DIR__ . '/_sessions';
if (!is_dir($session_dir)) { mkdir($session_dir, 0700, true); }
ini_set('session.use_only_cookies', 1);
ini_set('session.cookie_httponly', 1);
session_save_path($session_dir);
session_start();

require_once 'db_auth.php'; 

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
            "full_name" => $_SESSION['full_name'] ?? '',
            "email" => $_SESSION['email'] ?? '',
            "phone" => $_SESSION['phone'] ?? '',
            "role" => $_SESSION['sso_role'] ?? 'user',
            "position" => $_SESSION['position'] ?? 'Phụ trách Kinh doanh'
        ]);
    } else {
        sendJson(["status" => "logged_out"]);
    }
}

if ($action === 'logout') {
    $_SESSION = array();
    session_destroy();
    sendJson(["status" => "success", "message" => "Đã đăng xuất"]);
}

$input = json_decode(file_get_contents('php://input'), true);
if ($input) {
    $user = trim($input['username'] ?? '');
    $pass = $input['password'] ?? '';

    if (empty($user) || empty($pass)) {
        sendJson(["status" => "error", "message" => "Vui lòng nhập đầy đủ thông tin."]);
    }

    // Database disconnected - allow login with any credentials
    session_regenerate_id(true);
    
    $_SESSION['user'] = $user;
    $_SESSION['full_name'] = $user;
    $_SESSION['email'] = $user . '@example.com';
    $_SESSION['phone'] = '0000000000';
    $_SESSION['sso_role'] = 'admin';
    $_SESSION['position'] = 'Phụ trách Kinh doanh';

    sendJson([
        "status" => "success", 
        "user" => $_SESSION['user'],
        "full_name" => $_SESSION['full_name'],
        "email" => $_SESSION['email'],
        "phone" => $_SESSION['phone'],
        "role" => $_SESSION['sso_role'],
        "position" => $_SESSION['position']
    ]);
}
?>