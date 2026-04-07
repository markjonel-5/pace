<?php
session_start();
header('Content-Type: application/json');
require 'pace-database.php';

// Initialize secure guest arrays if they are empty
if (!isset($_SESSION['guest_cart'])) $_SESSION['guest_cart'] = "[]";
if (!isset($_SESSION['guest_wishlist'])) $_SESSION['guest_wishlist'] = "[]";

// If no user is logged in, return the secure guest arrays!
if (!isset($_SESSION['user_email'])) {
    echo json_encode([
        'success' => false, 
        'message' => 'No active session',
        'guest_cart' => json_decode($_SESSION['guest_cart'], true) ?: [],
        'guest_wishlist' => json_decode($_SESSION['guest_wishlist'], true) ?: []
    ]);
    exit;
}

$email = $conn->real_escape_string($_SESSION['user_email']);
$sql = "SELECT * FROM users WHERE email = '$email'";
$result = $conn->query($sql);

if ($result && $result->num_rows > 0) {
    $user = $result->fetch_assoc();
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
    echo json_encode([
        'success' => false, 
        'message' => 'User not found in database',
        'guest_cart' => json_decode($_SESSION['guest_cart'], true) ?: [],
        'guest_wishlist' => json_decode($_SESSION['guest_wishlist'], true) ?: []
    ]);
}
$conn->close();
?>