<?php
header('Content-Type: application/json');
require 'pace-database.php';

$data = json_decode(file_get_contents("php://input"), true);

if ($data && isset($data['email']) && isset($data['action'])) {
    $email = $conn->real_escape_string($data['email']);
    $action = $data['action'];

    if ($action === 'delete') {
        $sql = "DELETE FROM users WHERE email = '$email'";
        if ($conn->query($sql) === TRUE) {
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['success' => false, 'message' => $conn->error]);
        }
    } else if ($action === 'role' && isset($data['role'])) {
        $role = $conn->real_escape_string($data['role']);
        $status = $conn->real_escape_string($data['status']); 
        $sql = "UPDATE users SET role = '$role', status = '$status' WHERE email = '$email'";
        if ($conn->query($sql) === TRUE) {
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['success' => false, 'message' => $conn->error]);
        }
    } else if ($action === 'status' && isset($data['status'])) {
        $status = $conn->real_escape_string($data['status']);
        $sql = "UPDATE users SET status = '$status' WHERE email = '$email'";
        if ($conn->query($sql) === TRUE) {
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['success' => false, 'message' => $conn->error]);
        }
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid data']);
}
$conn->close();
?>