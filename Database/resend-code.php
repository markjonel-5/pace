<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

session_start();
header('Content-Type: application/json');

require 'PHPMailer/Exception.php';
require 'PHPMailer/PHPMailer.php';
require 'PHPMailer/SMTP.php';

// Check if it's the Signup Flow OR the Forgot Password Flow
if (isset($_SESSION['temp_user']) || isset($_SESSION['reset_user'])) {
    
    $new_code = rand(100000, 999999);
    $email = '';
    $fname = '';
    $body = '';

    // SCENARIO 1: Resending for Signup
    if (isset($_SESSION['temp_user'])) {
        $_SESSION['temp_user']['verify_code'] = $new_code;
        $email = $_SESSION['temp_user']['email'];
        $fname = $_SESSION['temp_user']['fname'];
        $body = "<div style='text-align: center; padding: 20px;'>
                    <h2 style='color: #C06C37;'>PACE Store</h2>
                    <p>Hi $fname, you requested a new code. Here it is:</p>
                    <h1 style='color: #C06C37; letter-spacing: 5px;'>$new_code</h1>
                  </div>";
    } 
    // SCENARIO 2: Resending for Password Reset
    else if (isset($_SESSION['reset_user'])) {
        $_SESSION['reset_user']['verify_code'] = $new_code;
        $email = $_SESSION['reset_user']['email'];
        $fname = $_SESSION['reset_user']['fname'];
        $body = "<div style='text-align: center; padding: 20px;'>
                   <h2><span style='color: #C06C37;'>PACE Store</span> Password Reset</h2>
                    <p>Hi $fname, you requested a new code to reset your password. Here it is:</p>
                    <h1 style='color: #C06C37; letter-spacing: 5px;'>$new_code</h1>
                  </div>";
    }

    $mail = new PHPMailer(true);
    try {
        $mail->isSMTP();
        $mail->Host       = 'smtp.gmail.com';
        $mail->SMTPAuth   = true;
        
        // --- INSERT YOUR GMAIL AND 16-LETTER PASSWORD HERE ---
        $mail->Username   = 'pace.store.admin@gmail.com'; 
        $mail->Password   = 'uxfnlpgymzqaumvj'; 
        
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port       = 587;

        $mail->setFrom('pace.store.admin@gmail.com', 'PACE Store'); 
        $mail->addAddress($email, $fname);

        $mail->isHTML(true);
        $mail->Subject = 'Your PACE Store Verification Code'; // Keeps the email thread together!
        $mail->Body    = $body;

        $mail->send();
        echo json_encode(['success' => true]);
        
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => 'Failed to send email.']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'session_expired']);
}
?>