<?php
header('Content-Type: application/json');
require 'pace-database.php';

$sql = "SELECT * FROM product_reviews ORDER BY id DESC";
$result = $conn->query($sql);
$reviews = [];

if ($result && $result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $row['photos'] = json_decode($row['photos'], true) ?: [];
        $row['rating'] = (int)$row['rating'];
        $reviews[] = $row;
    }
}

echo json_encode(['success' => true, 'reviews' => $reviews]);
?>