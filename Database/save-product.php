<?php
header('Content-Type: application/json');
require 'pace-database.php';

$conn->query("ALTER TABLE products MODIFY img LONGTEXT, MODIFY hover LONGTEXT");

$data = json_decode(file_get_contents("php://input"), true);

if (!$data) {
    echo json_encode(['success' => false, 'message' => 'No data received.']);
    exit;
}

$id = $conn->real_escape_string($data['id']);
$name = $conn->real_escape_string($data['name']);
$price = $conn->real_escape_string($data['price']);
$type = $conn->real_escape_string($data['type']);
$color = $conn->real_escape_string($data['color']);
$isNew = $data['isNew'] ? 1 : 0;
$img = $conn->real_escape_string($data['img']);
$hover = $conn->real_escape_string($data['hover']);

$stock = $conn->real_escape_string(json_encode($data['stock']));

$dateAdded = date("Y-m-d H:i:s");

$check = $conn->query("SELECT id FROM products WHERE id = '$id'");

if ($check->num_rows > 0) {
    $sql = "UPDATE products SET name='$name', price='$price', type='$type', color='$color', isNew=$isNew, img='$img', hover='$hover', stock='$stock' WHERE id='$id'";
} else {
    if ($id == "") {
        $id = substr($type, 0, 1) . rand(1000, 9999);
    }
    $sql = "INSERT INTO products (id, name, price, type, color, isNew, img, hover, stock, dateAdded) VALUES ('$id', '$name', '$price', '$type', '$color', $isNew, '$img', '$hover', '$stock', '$dateAdded')";
}

if ($conn->query($sql) === TRUE) {
    if ($check->num_rows > 0) {
        $conn->query("UPDATE products SET name='$name', type='$type' WHERE name = (SELECT name FROM products WHERE id='$id')");
    }
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'message' => $conn->error]);
}

$conn->close();
?>