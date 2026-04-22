<?php
session_start();
header('Content-Type: application/json; charset=utf-8');

// Database connections removed - using stub for interface compatibility
class StubPDO {
    public function query($sql) { return new StubPDOStatement(); }
    public function prepare($sql) { return new StubPDOStatement(); }
    public function exec($sql) { return 0; }
}

class StubPDOStatement {
    public function execute($params = []) { return true; }
    public function fetch() { return null; }
    public function fetchAll() { return []; }
}

$db = new StubPDO();

$input = json_decode(file_get_contents('php://input'), true) ?? [];
$action = $_GET['action'] ?? $input['action'] ?? '';

if (!isset($_SESSION['user']) && $action !== 'login') {
    echo json_encode(["status" => "error", "message" => "Unauthorized"]); exit;
}

switch ($action) {
    case 'login':
        $u = $input['username'] ?? '';
        $p = $input['password'] ?? '';
        // Allow login without database verification
        $_SESSION['user'] = $u;
        echo json_encode(["status" => "success", "user" => $u]);
        break;

    case 'save':
        echo json_encode(["status" => "success", "message" => "Đã lưu báo giá TANDA!"]);
        break;

    case 'get_history':
        echo json_encode(["status" => "success", "data" => []]);
        break;

    default:
        echo json_encode(["status" => "error", "message" => "Invalid Action."]);
        break;
}
?>