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

    try {
        $stmt = $pdo_auth->prepare("SELECT * FROM users WHERE username = ? LIMIT 1");
        $stmt->execute([$user]);
        $db_user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($db_user) {
            $is_valid = false;
            if (password_verify($pass, $db_user['password']) || $pass === $db_user['password']) {
                $is_valid = true;
            }

            if ($is_valid) {
                session_regenerate_id(true);
                
                $_SESSION['user'] = $db_user['username'];
                $_SESSION['full_name'] = $db_user['full_name'] ?? $db_user['username'];
                $_SESSION['email'] = $db_user['email'] ?? '';
                $_SESSION['phone'] = $db_user['phone'] ?? $db_user['sdt'] ?? $db_user['emergency_phone'] ?? '';
                // Lấy Role từ cột 'role' trong database (VD: 'admin' hoặc 'sale')
                $_SESSION['sso_role'] = strtolower($db_user['role'] ?? 'user');
                $_SESSION['position'] = $db_user['position'] ?? 'Phụ trách Kinh doanh';

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
        }
        sendJson(["status" => "error", "message" => "Tài khoản hoặc mật khẩu không chính xác."]);
    } catch (Exception $e) {
        sendJson(["status" => "error", "message" => "Lỗi hệ thống: " . $e->getMessage()]);
    }
}
?>