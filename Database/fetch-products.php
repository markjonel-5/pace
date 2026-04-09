<?php
header('Content-Type: application/json');
require 'pace-database.php';

$sql = "SELECT * FROM products";
$result = $conn->query($sql);

$products = [];
if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        
        $row['stock'] = json_decode($row['stock'], true);
        $row['isNew'] = $row['isNew'] == 1 ? true : false;
        
        $products[] = $row;
    }
}

echo json_encode(['success' => true, 'products' => $products]);
$conn->close();
?>