<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

header('Content-Type: application/json');

require 'pace-database.php';

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
    $mail->isSMTP();
    $mail->Host       = 'smtp.gmail.com';
    $mail->SMTPAuth   = true;
    
    $mail->Username   = 'pace.store.admin@gmail.com'; 
    $mail->Password   = 'uxfnlpgymzqaumvj'; 
    
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port       = 587;

    $mail->setFrom('pace.store.admin@gmail.com', 'PACE Store System'); 
    
    $mail->addAddress('pace.store.admin@gmail.com', 'PACE Admin'); 
    
    $mail->addReplyTo($senderEmail); 

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