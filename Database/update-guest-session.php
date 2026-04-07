<?php
session_start();
header('Content-Type: application/json');

$data = json_decode(file_get_contents("php://input"), true);

if (!$data || !isset($data['action'])) {
    echo json_encode(['success' => false]);
    exit;
}

if ($data['action'] === 'update_cart') {
    $_SESSION['guest_cart'] = json_encode($data['cart']);
    echo json_encode(['success' => true]);
} elseif ($data['action'] === 'update_wishlist') {
    $_SESSION['guest_wishlist'] = json_encode($data['wishlist']);
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false]);
}
?>