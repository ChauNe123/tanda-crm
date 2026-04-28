<?php
// File đã bị xóa - không còn gọi external API
http_response_code(400);
echo json_encode(["error" => "API này đã bị vô hiệu hóa. Hệ thống TANDA không sử dụng kho hàng bên ngoài."]);
?>