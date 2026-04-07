<?php
// "use" statements MUST be at the very top!
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

header('Content-Type: application/json');

// Include Database Connection
require 'pace-database.php';

// Include PHPMailer library files
require 'PHPMailer/Exception.php';
require 'PHPMailer/PHPMailer.php';
require 'PHPMailer/SMTP.php';

$data = json_decode(file_get_contents("php://input"), true);
if (!$data) {
    echo json_encode(['success' => false, 'message' => 'Invalid data format.']);
    exit;
}

$subject = htmlspecialchars($data['subject']);
$senderEmail = htmlspecialchars($data['email']);
$message = htmlspecialchars($data['message']);

$mail = new PHPMailer(true);

try {
    // Server settings
    $mail->isSMTP();
    $mail->Host       = 'smtp.gmail.com';
    $mail->SMTPAuth   = true;
    
    // Using your existing App Password configuration
    $mail->Username   = 'pace.store.admin@gmail.com'; 
    $mail->Password   = 'uxfnlpgymzqaumvj'; 
    
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port       = 587;

    // Email Details
    // Gmail forces the "From" email to be the authenticated account (pace.store.admin)
    $mail->setFrom('pace.store.admin@gmail.com', 'PACE Store System'); 
    
    // We send this contact form TO the admin
    $mail->addAddress('pace.store.admin@gmail.com', 'PACE Admin'); 
    
    // We add the customer as the "Reply-To" so you can easily reply to their inquiry
    $mail->addReplyTo($senderEmail); 

    // Content
    $mail->isHTML(true);
    $mail->Subject = 'Customer Support Inquiry: ' . $subject;
    $mail->Body    = "
        <div style='font-family: Arial, sans-serif; padding: 25px; border: 1px solid #eaeaea; border-radius: 8px; max-width: 600px; background-color: #ffffff;'>
            <h2 style='color: #C06C37; margin-top: 0;'>Customer Assistance Needed</h2>
            <p style='color: #555;'>Someone has reached out via the PACE Contact Us page.</p>
            
            <div style='background-color: #f9f9f9; padding: 15px; border-radius: 6px; margin: 20px 0;'>
                <p style='margin: 0 0 10px 0;'><strong>From:</strong> <a href='mailto:$senderEmail' style='color: #3498db;'>$senderEmail</a></p>
                <p style='margin: 0;'><strong>Subject:</strong> $subject</p>
            </div>
            
            <h4 style='color: #333; margin-bottom: 10px;'>Message:</h4>
            <div style='padding: 15px; border-left: 4px solid #C06C37; background-color: #fefcfb; color: #333; white-space: pre-wrap; line-height: 1.5;'>$message</div>
        </div>
    ";

    $mail->send();
    echo json_encode(['success' => true]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Message could not be sent. Mailer Error: ' . $mail->ErrorInfo]);
}
?>