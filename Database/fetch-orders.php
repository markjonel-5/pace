<?php
header('Content-Type: application/json');
require 'pace-database.php';

// Bulletproof check to avoid crashing if the table is empty or missing
$sql = "SELECT * FROM orders ORDER BY order_date DESC";
$result = $conn->query($sql);

if (!$result) {
    echo json_encode(['success' => true, 'orders' => []]);
    exit;
}

$orders = [];
if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        // Package it exactly how your JavaScript expects it!
        $orders[] = [
            'id' => $row['id'],
            'customerEmail' => $row['customer_email'],
            'customerName' => $row['customer_name'],
            'date' => $row['order_date'],
            'status' => $row['status'],
            'totalAmount' => $row['total_amount'],
            'items' => json_decode($row['items'], true),
            'paymentMethod' => $row['payment_method'],
            'deliveryType' => $row['delivery_type'],
            'shippingAddress' => json_decode($row['shipping_address'], true)
        ];
    }
}

echo json_encode(['success' => true, 'orders' => $orders]);
$conn->close();
?>