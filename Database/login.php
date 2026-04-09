<?php
session_start();
header('Content-Type: application/json');
require 'pace-database.php';

$data = json_decode(file_get_contents("php://input"), true);

if (!$data) {
    echo json_encode(['success' => false, 'message' => 'No data received.']);
    exit;
}

$usernameInput = $conn->real_escape_string($data['username']);
$passwordInput = $data['password'];

$sql = "SELECT * FROM users WHERE BINARY username = '$usernameInput' OR BINARY email = '$usernameInput'";
$result = $conn->query($sql);

if ($result->num_rows > 0) {
    $user = $result->fetch_assoc();

    if ($user['status'] === 'Blocked') {
        echo json_encode(['success' => false, 'message' => 'account_blocked', 'role' => $user['role']]);
        exit;
    }

    if (password_verify($passwordInput, $user['password'])) {

        $_SESSION['user_id'] = $user['id'];
        $_SESSION['user_role'] = $user['role'];
        $_SESSION['user_email'] = $user['email'];

        unset($user['password']);

        $user['addresses'] = isset($user['addresses']) ? json_decode($user['addresses'], true) ?: [] : [];
        $user['payments'] = isset($user['payment_methods']) ? json_decode($user['payment_methods'], true) ?: [] : [];
        $user['cart'] = isset($user['cart']) ? json_decode($user['cart'], true) ?: [] : [];
        $user['wishlist'] = isset($user['wishlist']) ? json_decode($user['wishlist'], true) ?: [] : [];
        $user['notifications'] = isset($user['notifications']) ? json_decode($user['notifications'], true) ?: [] : [];
        $user['chatHistory'] = isset($user['chatHistory']) ? json_decode($user['chatHistory'], true) ?: [] : [];
        $user['orderHistory'] = isset($user['orderHistory']) ? json_decode($user['orderHistory'], true) ?: [] : [];

        echo json_encode(['success' => true, 'user' => $user]);
    } else {
        echo json_encode(['success' => false, 'message' => 'wrong_password']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'user_not_found']);
}

$conn->close();
