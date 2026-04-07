<?php
session_start();
header('Content-Type: application/json');
require 'pace-database.php';

// Security check: Only Admins can fetch this!
if (!isset($_SESSION['user_role']) || $_SESSION['user_role'] !== 'admin') {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

// FIX: Sort by the primary key ID instead of the alphabetical text date!
$sql = "SELECT * FROM users ORDER BY id DESC";
$result = $conn->query($sql);
$users = [];

if ($result && $result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        unset($row['password']); // Protect passwords
        // Decode all JSON strings back to arrays
        $row['addresses'] = json_decode($row['addresses'], true) ?: [];
        $row['payments'] = json_decode($row['payment_methods'], true) ?: []; 
        $row['cart'] = json_decode($row['cart'], true) ?: [];
        $row['wishlist'] = json_decode($row['wishlist'], true) ?: [];
        $row['notifications'] = json_decode($row['notifications'], true) ?: [];
        $row['chatHistory'] = json_decode($row['chatHistory'], true) ?: [];
        $row['orderHistory'] = json_decode($row['orderHistory'], true) ?: [];
        $users[] = $row;
    }
}
echo json_encode(['success' => true, 'users' => $users]);
$conn->close();
?>