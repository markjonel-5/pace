<?php
session_start();
header('Content-Type: application/json');
require 'pace-database.php';

$data = json_decode(file_get_contents("php://input"), true);

if (!$data || !isset($data['code'])) {
    echo json_encode(['success' => false, 'message' => 'No code provided.']);
    exit;
}

$entered_code = $data['code'];

if (isset($_SESSION['temp_user'])) {
    $temp_user = $_SESSION['temp_user'];

    if ($entered_code == $temp_user['verify_code']) {

        $fname = $temp_user['fname'];
        $lname = $temp_user['lname'];
        $email = $temp_user['email'];
        $username = $temp_user['username'];
        $hashed_password = $temp_user['password'];
        $current_date = date("F j, Y");

        $insert_sql = "INSERT INTO users (first_name, last_name, email, username, password, role, status, registered_date)
                       VALUES ('$fname', '$lname', '$email', '$username', '$hashed_password', 'user', 'Active', '$current_date')";

        if ($conn->query($insert_sql) === TRUE) {

            unset($_SESSION['temp_user']);
            
            echo json_encode(['success' => true, 'action' => 'signup_success']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Database error.']);
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'invalid_code']);
    }
    exit;
}

if (isset($_SESSION['reset_user'])) {
    if ($entered_code == $_SESSION['reset_user']['verify_code']) {

        echo json_encode(['success' => true, 'action' => 'goto_reset']);
    } else {
        echo json_encode(['success' => false, 'message' => 'invalid_code']);
    }
    exit;
}

echo json_encode(['success' => false, 'message' => 'session_expired']);
$conn->close();
?>