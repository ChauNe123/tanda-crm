<?php
// ==========================================
// CÔNG CỤ TẠO TÀI KHOẢN MỚI
// ==========================================

require_once 'db.php';

$message = '';
$messageType = '';

if($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = trim($_POST['username'] ?? '');
    $password = $_POST['password'] ?? '';
    $full_name = trim($_POST['full_name'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $phone = trim($_POST['phone'] ?? '');
    $role = $_POST['role'] ?? 'staff';
    
    // Validate
    if(empty($username) || empty($password) || empty($full_name)) {
        $message = 'Vui lòng điền đầy đủ: Username, Mật khẩu, Tên đầy đủ!';
        $messageType = 'error';
    } else if(strlen($username) < 3) {
        $message = 'Username phải có ít nhất 3 ký tự!';
        $messageType = 'error';
    } else if(strlen($password) < 6) {
        $message = 'Mật khẩu phải có ít nhất 6 ký tự!';
        $messageType = 'error';
    } else {
        try {
            $hashedPassword = password_hash($password, PASSWORD_BCRYPT);
            $stmt = $pdo->prepare("INSERT INTO users (username, password, full_name, email, phone, role) VALUES (?, ?, ?, ?, ?, ?)");
            $stmt->execute([$username, $hashedPassword, $full_name, $email, $phone, $role]);
            
            $message = "✅ Tạo tài khoản thành công!<br>Username: <strong>$username</strong><br>Mật khẩu: <strong>$password</strong>";
            $messageType = 'success';
        } catch(Exception $e) {
            if(strpos($e->getMessage(), 'Duplicate') !== false) {
                $message = 'Username này đã tồn tại! Hãy chọn username khác.';
            } else {
                $message = 'Lỗi: ' . $e->getMessage();
            }
            $messageType = 'error';
        }
    }
}
?>
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tạo Tài Khoản TANDA</title>
    <style>
        body { font-family: Arial, sans-serif; background: #f5f5f5; padding: 20px; }
        .container { max-width: 500px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #333; margin-top: 0; }
        .form-group { margin-bottom: 15px; }
        label { display: block; margin-bottom: 5px; font-weight: bold; color: #333; }
        input, select { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px; box-sizing: border-box; font-size: 14px; }
        input:focus, select:focus { outline: none; border-color: #dc2626; box-shadow: 0 0 5px rgba(220, 38, 38, 0.2); }
        button { width: 100%; padding: 12px; background: #dc2626; color: white; border: none; border-radius: 5px; font-size: 16px; font-weight: bold; cursor: pointer; }
        button:hover { background: #b91c1c; }
        .message { padding: 15px; border-radius: 5px; margin-bottom: 20px; }
        .error { background: #fee; color: #dc2626; border-left: 4px solid #dc2626; }
        .success { background: #efe; color: #16a34a; border-left: 4px solid #16a34a; }
        .code { background: #f5f5f5; padding: 2px 6px; border-radius: 3px; font-family: monospace; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔐 Tạo Tài Khoản TANDA</h1>
        
        <?php if(!empty($message)): ?>
            <div class="message <?php echo $messageType; ?>">
                <?php echo $message; ?>
            </div>
        <?php endif; ?>
        
        <form method="POST">
            <div class="form-group">
                <label for="username">Username (3-20 ký tự):</label>
                <input type="text" id="username" name="username" placeholder="admin, tuanhai, myhoa..." required minlength="3" maxlength="20">
            </div>
            
            <div class="form-group">
                <label for="password">Mật khẩu (tối thiểu 6 ký tự):</label>
                <input type="password" id="password" name="password" placeholder="••••••" required minlength="6">
            </div>
            
            <div class="form-group">
                <label for="full_name">Tên Đầy Đủ:</label>
                <input type="text" id="full_name" name="full_name" placeholder="Lê Tuấn Hải" required>
            </div>
            
            <div class="form-group">
                <label for="email">Email:</label>
                <input type="email" id="email" name="email" placeholder="tuanhai@tanda.vn">
            </div>
            
            <div class="form-group">
                <label for="phone">Số điện thoại:</label>
                <input type="text" id="phone" name="phone" placeholder="0933 129 155">
            </div>
            
            <div class="form-group">
                <label for="role">Vai trò:</label>
                <select id="role" name="role">
                    <option value="admin">Quản trị viên (Admin)</option>
                    <option value="staff">Nhân viên (Staff)</option>
                    <option value="manager">Quản lý (Manager)</option>
                </select>
            </div>
            
            <button type="submit">➕ Tạo Tài Khoản</button>
        </form>
        
        <hr style="margin-top: 30px; border: none; border-top: 1px solid #eee;">
        
        <div style="margin-top: 20px; text-align: center;">
            <p><a href="view_accounts.php" style="color: #0284c7; text-decoration: none;">👁️ Xem danh sách tài khoản</a></p>
            <p><a href="index.html" style="color: #0284c7; text-decoration: none;">🏠 Quay lại trang chính</a></p>
        </div>
    </div>
</body>
</html>
