<?php
// "use" statements MUST be at the very top!
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

session_start(); // Start a session to temporarily hold the user's data and code
header('Content-Type: application/json');

// Include Database Connection
require 'pace-database.php';

// Include PHPMailer library files
require 'PHPMailer/Exception.php';
require 'PHPMailer/PHPMailer.php';
require 'PHPMailer/SMTP.php';

// Get the JSON data sent from JavaScript
$data = json_decode(file_get_contents("php://input"), true);

if (!$data) {
    echo json_encode(['success' => false, 'message' => 'No data received.']);
    exit;
}

// Clean the inputs
$fname = $conn->real_escape_string($data['firstName']);
$lname = $conn->real_escape_string($data['lastName']);
$email = $conn->real_escape_string($data['email']);
$username = $conn->real_escape_string($data['username']);
$password = $data['password'];

// 1. Check if email or username already exists in the database
$check_sql = "SELECT * FROM users WHERE email = '$email' OR username = '$username'";
$result = $conn->query($check_sql);

if ($result->num_rows > 0) {
    $existing_user = $result->fetch_assoc();
    if ($existing_user['email'] === $email) {
        echo json_encode(['success' => false, 'message' => 'email_exists']);
    } else {
        echo json_encode(['success' => false, 'message' => 'username_exists']);
    }
    exit;
}

// 2. Hash the password
$hashed_password = password_hash($password, PASSWORD_DEFAULT);

// 3. Generate a random 6-digit code
$verification_code = rand(100000, 999999);

// 4. Save user details and the code into a PHP Session (The "Waiting Room")
$_SESSION['temp_user'] = [
    'fname' => $fname,
    'lname' => $lname,
    'email' => $email,
    'username' => $username,
    'password' => $hashed_password,
    'verify_code' => $verification_code
];

// 5. Send the Email using PHPMailer
$mail = new PHPMailer(true);

try {
    // Server settings
    $mail->isSMTP();
    $mail->Host       = 'smtp.gmail.com';
    $mail->SMTPAuth   = true;
    
    // Use the EXACT email you created the password with
    $mail->Username   = 'pace.store.admin@gmail.com'; 
    
    // Type the 16 letters with NO SPACES
    $mail->Password   = 'uxfnlpgymzqaumvj'; 
    
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port       = 587;

    // Email Details (Make sure this matches the Username above)
    $mail->setFrom('pace.store.admin@gmail.com', 'PACE Store'); 
    $mail->addAddress($email, $fname); // Send TO the user's email

    // Content
    $mail->isHTML(true);
    $mail->Subject = 'Your PACE Store Verification Code';
    $mail->Body    = "
        <div style='font-family: Arial, sans-serif; text-align: center; padding: 20px;'>
            <h2>Welcome to <span style='color: #C06C37;'>PACE Store</span></h2>
            <p>Hi $fname, thank you for registering.</p>
            <p>Your 6-digit verification code is:</p>
            <h1 style='color: #C06C37; letter-spacing: 5px;'>$verification_code</h1>
            <p>Please enter this code on the website to complete your registration.</p>
        </div>
    ";

    $mail->send();
    // Tell JavaScript it was successful and to redirect the user
    echo json_encode(['success' => true, 'redirect' => 'verify']);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Message could not be sent. Mailer Error: ' . $mail->ErrorInfo]);
}

$conn->close();
