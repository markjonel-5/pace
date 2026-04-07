<?php
header('Content-Type: application/json');
require 'pace-database.php';

$data = json_decode(file_get_contents("php://input"), true);
if (!$data) exit;

$id = $conn->real_escape_string($data['id']);
$email = $conn->real_escape_string($data['userEmail']);
$name = $conn->real_escape_string($data['userName']);
$product = $conn->real_escape_string($data['productName']);
$rating = (int)$data['rating'];
$comment = $conn->real_escape_string($data['comment']);
$photos = $conn->real_escape_string(json_encode($data['photos']));
$video = $conn->real_escape_string($data['video']);
$date = $conn->real_escape_string($data['date']);

$sql = "INSERT INTO product_reviews (id, userEmail, userName, productName, rating, comment, photos, video, date) 
        VALUES ('$id', '$email', '$name', '$product', $rating, '$comment', '$photos', '$video', '$date')";

if ($conn->query($sql) === TRUE) {
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'message' => $conn->error]);
}
?>