<?php
session_start();
header('Content-Type: application/json');
require 'pace-database.php';

// Security check: Only Admins can fetch this!
if (!isset($_SESSION['user_role']) || $_SESSION['user_role'] !== 'admin') {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

$sql = "SELECT * FROM users ORDER BY id DESC";
$result = $conn->query($sql);
$users = [];

if ($result && $result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        unset($row['password']); // Protect passwords
        
        $row['addresses'] = json_decode($row['addresses'] ?? '[]', true) ?: [];
        $row['payments'] = json_decode($row['payment_methods'] ?? '[]', true) ?: []; 
        $row['cart'] = json_decode($row['cart'] ?? '[]', true) ?: [];
        $row['wishlist'] = json_decode($row['wishlist'] ?? '[]', true) ?: [];
        $row['notifications'] = json_decode($row['notifications'] ?? '[]', true) ?: [];
        $row['chatHistory'] = json_decode($row['chatHistory'] ?? '[]', true) ?: [];
        
        // Start with the static history as a safe fallback
        $liveOrderHistory = json_decode($row['orderHistory'] ?? '[]', true) ?: [];
        
        $userEmail = $conn->real_escape_string($row['email']);
        
        // Fetch live orders using the correct 'customer_email' column
        $ordersResult = false;
        try {
            $ordersSql = "SELECT * FROM orders WHERE customer_email = '$userEmail' ORDER BY id DESC";
            $ordersResult = $conn->query($ordersSql);
        } catch (Exception $e) { } // If it fails, do nothing and use the fallback

        if ($ordersResult && $ordersResult->num_rows > 0) {
            $liveOrderHistory = []; // Wipe the stale data, we have live data!
            while($orderRow = $ordersResult->fetch_assoc()) {
                $liveOrderHistory[] = [
                    'id' => $orderRow['id'] ?? 'N/A',
                    'date' => $orderRow['date'] ?? $orderRow['order_date'] ?? 'N/A',
                    'totalAmount' => $orderRow['total_amount'] ?? $orderRow['totalAmount'] ?? $orderRow['total'] ?? 0,
                    'status' => $orderRow['status'] ?? 'Unknown'
                ];
            }
        }
        
        // Apply the updated order history
        $row['orderHistory'] = $liveOrderHistory;
        $users[] = $row;
    }
}
echo json_encode(['success' => true, 'users' => $users]);
$conn->close();
?>