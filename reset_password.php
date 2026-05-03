<?php
// ==========================================
// CÔNG CỤ RESET MẬT KHẨU
// ==========================================

require_once 'db.php';

$message = '';
$messageType = '';
$users = [];

// Lấy danh sách tài khoản
try {
    $stmt = $pdo->query("SELECT id, username, full_name FROM users ORDER BY id ASC");
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
} catch(Exception $e) {}

if($_SERVER['REQUEST_METHOD'] === 'POST') {
    $user_id = $_POST['user_id'] ?? '';
    $new_password = $_POST['new_password'] ?? '';
    
    if(empty($user_id) || empty($new_password)) {
        $message = 'Vui lòng chọn tài khoản và nhập mật khẩu mới!';
        $messageType = 'error';
    } else if(strlen($new_password) < 6) {
        $message = 'Mật khẩu phải có ít nhất 6 ký tự!';
        $messageType = 'error';
    } else {
        try {
            $hashedPassword = password_hash($new_password, PASSWORD_BCRYPT);
            $stmt = $pdo->prepare("UPDATE users SET password = ? WHERE id = ?");
            $stmt->execute([$hashedPassword, $user_id]);
            
            $selectedUser = array_filter($users, fn($u) => $u['id'] == $user_id);
            $selectedUser = reset($selectedUser);
            
            $message = "✅ Reset mật khẩu thành công!<br>Username: <strong>" . htmlspecialchars($selectedUser['username']) . "</strong><br>Mật khẩu mới: <strong>$new_password</strong>";
            $messageType = 'success';
        } catch(Exception $e) {
            $message = 'Lỗi: ' . $e->getMessage();
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
    <title>Reset Mật Khẩu TANDA</title>
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
        .warning { background: #fef3c7; color: #92400e; border-left: 4px solid #f59e0b; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔐 Reset Mật Khẩu TANDA</h1>
        
        <?php if(!empty($message)): ?>
            <div class="message <?php echo $messageType; ?>">
                <?php echo $message; ?>
            </div>
        <?php endif; ?>
        
        <div class="message warning">
            ⚠️ <strong>Cảnh báo:</strong> Sau khi reset, tài khoản cũ sẽ không thể đăng nhập bằng mật khẩu cũ!
        </div>
        
        <form method="POST">
            <div class="form-group">
                <label for="user_id">Chọn tài khoản cần reset:</label>
                <select id="user_id" name="user_id" required>
                    <option value="">-- Chọn --</option>
                    <?php foreach($users as $user): ?>
                        <option value="<?php echo $user['id']; ?>">
                            <?php echo htmlspecialchars($user['username'] . ' (' . $user['full_name'] . ')'); ?>
                        </option>
                    <?php endforeach; ?>
                </select>
            </div>
            
            <div class="form-group">
                <label for="new_password">Mật khẩu mới (tối thiểu 6 ký tự):</label>
                <input type="password" id="new_password" name="new_password" placeholder="••••••" required minlength="6">
            </div>
            
            <button type="submit">🔄 Reset Mật Khẩu</button>
        </form>
        
        <hr style="margin-top: 30px; border: none; border-top: 1px solid #eee;">
        
        <div style="margin-top: 20px; text-align: center;">
            <p><a href="view_accounts.php" style="color: #0284c7; text-decoration: none;">👁️ Xem danh sách tài khoản</a></p>
            <p><a href="create_user.php" style="color: #0284c7; text-decoration: none;">➕ Tạo tài khoản mới</a></p>
            <p><a href="index.html" style="color: #0284c7; text-decoration: none;">🏠 Quay lại trang chính</a></p>
        </div>
    </div>
</body>
</html>
