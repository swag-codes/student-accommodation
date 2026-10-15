
<?php
session_start();

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

echo json_encode([
    'logged_in' => isset($_SESSION['user_id']),
    'user_name' => $_SESSION['user_name'] ?? null
], JSON_UNESCAPED_UNICODE);
