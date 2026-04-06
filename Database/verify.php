<?php
session_start();
header('Content-Type: application/json');
require 'pace-database.php';

// Get the code sent from JavaScript
$data = json_decode(file_get_contents("php://input"), true);

if (!$data || !isset($data['code'])) {
    echo json_encode(['success' => false, 'message' => 'No code provided.']);
    exit;
}

$entered_code = $data['code'];

// SCENARIO 1: The user is here from the SIGNUP page
if (isset($_SESSION['temp_user'])) {
    $temp_user = $_SESSION['temp_user'];

    if ($entered_code == $temp_user['verify_code']) {
        // The code is correct! Let's insert them into the database
        $fname = $temp_user['fname'];
        $lname = $temp_user['lname'];
        $email = $temp_user['email'];
        $username = $temp_user['username'];
        $hashed_password = $temp_user['password'];
        $current_date = date("F j, Y");

        $insert_sql = "INSERT INTO users (first_name, last_name, email, username, password, role, status, registered_date)
                       VALUES ('$fname', '$lname', '$email', '$username', '$hashed_password', 'user', 'Active', '$current_date')";

        if ($conn->query($insert_sql) === TRUE) {
            // Success! Delete the temporary session so they can't reuse it
            unset($_SESSION['temp_user']);
            
            // Tell JS to go to the login page
            echo json_encode(['success' => true, 'action' => 'signup_success']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Database error.']);
        }
    } else {
        // Wrong code
        echo json_encode(['success' => false, 'message' => 'invalid_code']);
    }
    exit;
}

// SCENARIO 2: The user is here from the FORGOT PASSWORD page (Placeholder for our next step!)
if (isset($_SESSION['reset_user'])) {
    if ($entered_code == $_SESSION['reset_user']['verify_code']) {
        // Tell JS to jump to reset-password.html
        echo json_encode(['success' => true, 'action' => 'goto_reset']);
    } else {
        echo json_encode(['success' => false, 'message' => 'invalid_code']);
    }
    exit;
}

// If no session exists, the user refreshed the page too many times or came here by mistake
echo json_encode(['success' => false, 'message' => 'session_expired']);
$conn->close();
?>