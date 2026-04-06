<?php
session_start();
header('Content-Type: application/json');
require 'pace-database.php';

$data = json_decode(file_get_contents("php://input"), true);

if (!$data) {
    echo json_encode(['success' => false, 'message' => 'No data received.']);
    exit;
}

$usernameInput = $conn->real_escape_string($data['username']);
$passwordInput = $data['password'];

// We use BINARY here to force 100% strict case-sensitive matching!
$sql = "SELECT * FROM users WHERE BINARY username = '$usernameInput' OR BINARY email = '$usernameInput'";
$result = $conn->query($sql);

if ($result->num_rows > 0) {
    $user = $result->fetch_assoc();
    
    // Check if the account is blocked
    if ($user['status'] === 'Blocked') {
        echo json_encode(['success' => false, 'message' => 'account_blocked', 'role' => $user['role']]);
        exit;
    }

    // Verify the encrypted password
    if (password_verify($passwordInput, $user['password'])) {
        
        // Start a secure server session
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['user_role'] = $user['role'];
        
        // Remove the password from the array before sending it back to JavaScript for security
        unset($user['password']); 
        
        echo json_encode(['success' => true, 'user' => $user]);
    } else {
        echo json_encode(['success' => false, 'message' => 'wrong_password']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'user_not_found']);
}

$conn->close();
?>