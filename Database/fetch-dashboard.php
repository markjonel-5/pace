<?php
header('Content-Type: application/json');
require 'pace-database.php';

$dashboard = [
    'users' => [],
    'products' => [],
    'orders' => []
];

// fetch users
$resUsers = $conn->query("SELECT * FROM users");
if ($resUsers && $resUsers->num_rows > 0) {
    while($row = $resUsers->fetch_assoc()) {
        $dashboard['users'][] = $row;
    }
}

// fetch products
$resProducts = $conn->query("SELECT * FROM products");
if ($resProducts && $resProducts->num_rows > 0) {
    while($row = $resProducts->fetch_assoc()) {
        $dashboard['products'][] = $row;
    }
}

// fetch orders
$resOrders = $conn->query("SELECT * FROM orders ORDER BY order_date DESC");
if ($resOrders && $resOrders->num_rows > 0) {
    while($row = $resOrders->fetch_assoc()) {
        $row['customerEmail'] = $row['customer_email'];
        $row['customerName'] = $row['customer_name'];
        $row['totalAmount'] = $row['total_amount'];
        $row['paymentMethod'] = $row['payment_method'];
        $row['deliveryType'] = $row['delivery_type'];
        $row['date'] = $row['order_date'];
        
        $row['items'] = json_decode($row['items'], true);
        $row['shippingAddress'] = json_decode($row['shipping_address'], true);
        
        $dashboard['orders'][] = $row;
    }
}

echo json_encode(['success' => true, 'data' => $dashboard]);
$conn->close();
?>