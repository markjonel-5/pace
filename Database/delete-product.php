<?php
header('Content-Type: application/json');
require 'pace-database.php';

$data = json_decode(file_get_contents("php://input"), true);

if (isset($data['id'])) {
    $id = $conn->real_escape_string($data['id']);
    
    if ($conn->query("DELETE FROM products WHERE id = '$id'") === TRUE) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Database error.']);
    }
}
$conn->close();
?>