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

if (!$data || !isset($data['email'])) {
    echo json_encode(['success' => false, 'message' => 'No email provided.']);
    exit;
}

$emailInput = $conn->real_escape_string($data['email']);

// 1. Check if the email exists in the database
$sql = "SELECT * FROM users WHERE email = '$emailInput'";
$result = $conn->query($sql);

if ($result->num_rows > 0) {
    $user = $result->fetch_assoc();
    $fname = $user['first_name'];

    // 2. Generate a 6-digit code and save it to the "Reset" session
    $reset_code = rand(100000, 999999);
    $_SESSION['reset_user'] = [
        'email' => $emailInput,
        'fname' => $fname,
        'verify_code' => $reset_code
    ];

    // 3. Send the email
    $mail = new PHPMailer(true);
    try {
        $mail->isSMTP();
        $mail->Host       = 'smtp.gmail.com';
        $mail->SMTPAuth   = true;

        // --- PUT YOUR GMAIL AND APP PASSWORD HERE ---
        $mail->Username   = 'pace.store.admin@gmail.com';
        $mail->Password   = 'uxfnlpgymzqaumvj';

        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port       = 587;

        $mail->setFrom('pace.store.admin@gmail.com', 'PACE Store');
        $mail->addAddress($emailInput, $fname);

        $mail->isHTML(true);
        $mail->Subject = 'Your PACE Store Verification Code'; // Kept the exact same subject for threading!
        $mail->Body    = "<div style='text-align: center; padding: 20px;'>
                            <h2><span style='color: #C06C37;'>PACE Store</span> Password Reset</h2>
                            <p>Hi $fname, we received a request to reset your password.</p>
                            <p>Your 6-digit verification code is:</p>
                            <h1 style='color: #C06C37; letter-spacing: 5px;'>$reset_code</h1>
                            <p>If you did not request this, please ignore this email.</p>
                          </div>";

        $mail->send();
        echo json_encode(['success' => true]);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => 'Failed to send email.']);
    }
} else {
    // We return a generic error for security (so hackers can't guess emails)
    echo json_encode(['success' => false, 'message' => 'email_not_found']);
}

$conn->close();
