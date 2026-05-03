<?php
// ==========================================
// CÔNG CỤ XEM TÀI KHOẢN ĐĂNG NHẬP
// ==========================================

require_once 'db.php';

?>
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Xem Tài Khoản TANDA</title>
    <style>
        body { font-family: Arial, sans-serif; background: #f5f5f5; padding: 20px; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #333; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background-color: #dc2626; color: white; }
        tr:hover { background-color: #f9f9f9; }
        .error { color: #dc2626; padding: 15px; background: #fee; border-radius: 5px; margin: 20px 0; }
        .success { color: #16a34a; padding: 15px; background: #efe; border-radius: 5px; margin: 20px 0; }
        .code { background: #f5f5f5; padding: 2px 6px; border-radius: 3px; font-family: monospace; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔐 Công Cụ Xem Tài Khoản TANDA</h1>
        
        <?php
        try {
            $stmt = $pdo->query("SELECT id, username, full_name, email, phone, role FROM users ORDER BY id ASC");
            $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            if(count($users) > 0) {
                echo '<div class="success">✅ Tìm thấy <strong>' . count($users) . '</strong> tài khoản</div>';
                echo '<table>';
                echo '<thead><tr><th>ID</th><th>Username</th><th>Tên Đầy Đủ</th><th>Email</th><th>SĐT</th><th>Vai Trò</th></tr></thead>';
                echo '<tbody>';
                foreach($users as $user) {
                    echo '<tr>';
                    echo '<td>' . $user['id'] . '</td>';
                    echo '<td><code class="code">' . htmlspecialchars($user['username']) . '</code></td>';
                    echo '<td>' . htmlspecialchars($user['full_name']) . '</td>';
                    echo '<td>' . htmlspecialchars($user['email']) . '</td>';
                    echo '<td>' . htmlspecialchars($user['phone']) . '</td>';
                    echo '<td><strong>' . htmlspecialchars($user['role']) . '</strong></td>';
                    echo '</tr>';
                }
                echo '</tbody>';
                echo '</table>';
                
                echo '<div style="margin-top: 30px; padding: 15px; background: #f0f9ff; border-left: 4px solid #0284c7; border-radius: 5px;">';
                echo '<h3 style="margin-top: 0;">💡 Hướng dẫn:</h3>';
                echo '<ol>';
                echo '<li>Sử dụng <strong>Username</strong> ở trên để đăng nhập</li>';
                echo '<li>Nếu bạn biết mật khẩu, hãy nhập</li>';
                echo '<li>Nếu không biết, liên hệ quản trị viên để reset</li>';
                echo '<li>Hoặc tạo tài khoản mới bằng file <code class="code">setup.sql</code></li>';
                echo '</ol>';
                echo '</div>';
            } else {
                echo '<div class="error">⚠️ Không tìm thấy tài khoản nào trong cơ sở dữ liệu!</div>';
                echo '<p style="color: #666;">Hãy import file <code class="code">setup.sql</code> để tạo tài khoản mặc định.</p>';
            }
        } catch(Exception $e) {
            echo '<div class="error">❌ Lỗi: ' . htmlspecialchars($e->getMessage()) . '</div>';
        }
        ?>
        
        <hr style="margin-top: 40px; border: none; border-top: 1px solid #eee;">
        
        <div style="margin-top: 20px; padding: 15px; background: #fef3c7; border-radius: 5px;">
            <h3 style="margin-top: 0;">📌 Tài Khoản Mặc Định (nếu đã import setup.sql):</h3>
            <ul>
                <li><strong>Username:</strong> <code class="code">admin</code> | <strong>Password:</strong> <code class="code">123456</code></li>
                <li><strong>Username:</strong> <code class="code">tuanhai</code> | <strong>Password:</strong> <code class="code">123456</code></li>
            </ul>
        </div>
    </div>
</body>
</html>
