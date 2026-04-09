<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

session_start();
header('Content-Type: application/json');

require 'pace-database.php';

require 'PHPMailer/Exception.php';
require 'PHPMailer/PHPMailer.php';
require 'PHPMailer/SMTP.php';

$data = json_decode(file_get_contents("php://input"), true);

if (!$data) {
    echo json_encode(['success' => false, 'message' => 'No data received.']);
    exit;
}

$fname = $conn->real_escape_string($data['firstName']);
$lname = $conn->real_escape_string($data['lastName']);
$email = $conn->real_escape_string($data['email']);
$username = $conn->real_escape_string($data['username']);
$password = $data['password'];

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

$hashed_password = password_hash($password, PASSWORD_DEFAULT);

$verification_code = rand(100000, 999999);

$_SESSION['temp_user'] = [
    'fname' => $fname,
    'lname' => $lname,
    'email' => $email,
    'username' => $username,
    'password' => $hashed_password,
    'verify_code' => $verification_code
];

$mail = new PHPMailer(true);

try {
    $mail->isSMTP();
    $mail->Host       = 'smtp.gmail.com';
    $mail->SMTPAuth   = true;
    
    $mail->Username   = 'pace.store.admin@gmail.com'; 
    $mail->Password   = 'uxfnlpgymzqaumvj'; 
    
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port       = 587;

    $mail->setFrom('pace.store.admin@gmail.com', 'PACE Store'); 
    $mail->addAddress($email, $fname);

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
    echo json_encode(['success' => true, 'redirect' => 'verify']);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Message could not be sent. Mailer Error: ' . $mail->ErrorInfo]);
}

$conn->close();
