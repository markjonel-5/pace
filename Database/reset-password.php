<?php
session_start();
header('Content-Type: application/json');
require 'pace-database.php';

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($_SESSION['reset_user'])) {
    echo json_encode(['success' => false, 'message' => 'session_expired']);
    exit;
}

if (!$data || !isset($data['password'])) {
    echo json_encode(['success' => false, 'message' => 'No password provided.']);
    exit;
}

$email = $_SESSION['reset_user']['email'];
$new_password = password_hash($data['password'], PASSWORD_DEFAULT);

$update_sql = "UPDATE users SET password = '$new_password' WHERE email = '$email'";

if ($conn->query($update_sql) === TRUE) {
    unset($_SESSION['reset_user']);
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'message' => 'database_error']);
}

$conn->close();
?>