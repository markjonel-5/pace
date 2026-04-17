<?php
session_start();
header('Content-Type: application/json');
require 'pace-database.php';

if (!isset($_SESSION['user_role']) || $_SESSION['user_role'] !== 'admin') {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

$sql = "SELECT * FROM users ORDER BY created_at DESC";
$result = $conn->query($sql);
$users = [];

if ($result && $result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        unset($row['password']);
        
        $row['addresses'] = json_decode($row['addresses'] ?? '[]', true) ?: [];
        $row['payments'] = json_decode($row['payment_methods'] ?? '[]', true) ?: []; 
        $row['cart'] = json_decode($row['cart'] ?? '[]', true) ?: [];
        $row['wishlist'] = json_decode($row['wishlist'] ?? '[]', true) ?: [];
        $row['notifications'] = json_decode($row['notifications'] ?? '[]', true) ?: [];
        $row['chatHistory'] = json_decode($row['chatHistory'] ?? '[]', true) ?: [];
        
        $liveOrderHistory = json_decode($row['orderHistory'] ?? '[]', true) ?: [];
        
        $userEmail = $conn->real_escape_string($row['email']);
        
        $ordersResult = false;
        try {
            $ordersSql = "SELECT * FROM orders WHERE customer_email = '$userEmail' ORDER BY id DESC";
            $ordersResult = $conn->query($ordersSql);
        } catch (Exception $e) { }

        if ($ordersResult && $ordersResult->num_rows > 0) {
            $liveOrderHistory = [];
            while($orderRow = $ordersResult->fetch_assoc()) {
                $liveOrderHistory[] = [
                    'id' => $orderRow['id'] ?? 'N/A',
                    'date' => $orderRow['date'] ?? $orderRow['order_date'] ?? 'N/A',
                    'totalAmount' => $orderRow['total_amount'] ?? $orderRow['totalAmount'] ?? $orderRow['total'] ?? 0,
                    'status' => $orderRow['status'] ?? 'Unknown'
                ];
            }
        }
        
        $row['orderHistory'] = $liveOrderHistory;
        $users[] = $row;
    }
}
echo json_encode(['success' => true, 'users' => $users]);
$conn->close();
?>