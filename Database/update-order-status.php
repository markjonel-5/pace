<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

header('Content-Type: application/json');
require 'pace-database.php';
require 'PHPMailer/Exception.php';
require 'PHPMailer/PHPMailer.php';
require 'PHPMailer/SMTP.php';

$data = json_decode(file_get_contents("php://input"), true);

if ($data && isset($data['id']) && isset($data['status'])) {
    $id = $conn->real_escape_string($data['id']);
    $status = $conn->real_escape_string($data['status']);
    $messageType = $data['messageType'] ?? 'shipped';

    if ($conn->query("UPDATE orders SET status = '$status' WHERE id = '$id'") === TRUE) {
        
        if ($status !== 'Completed') {
            $result = $conn->query("SELECT customer_name, customer_email FROM orders WHERE id = '$id'");
            if ($result->num_rows > 0) {
                $order = $result->fetch_assoc();
                $email = $order['customer_email'];
                $name = $order['customer_name'];

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
                    $mail->addAddress($email, $name);
                    $mail->isHTML(true);

                    if ($messageType === 'packed') {
                        $mail->Subject = "Your Order is Ready for Pick-Up! ($id)";
                        $headline = "Your order is packed and ready!";
                        $subtext = "You can now head to the PACE physical store to collect your items.";
                    } else {
                        $mail->Subject = "Your Order has Shipped! ($id)";
                        $headline = "Your order is on its way!";
                        $subtext = "Great news! Your package has been handed over to our courier and is heading to your address.";
                    }

                    $buttonLink = "http://localhost/pace/complete-order.php?id=" . $id;

                    $mail->Body = "
                    <div style='font-family: Arial, sans-serif; padding: 20px; color: #333; text-align: center;'>
                        <h2 style='color: #C06C37;'>$headline</h2>
                        <p style='font-size: 16px;'>$subtext</p>
                        <p>Order ID: <strong>$id</strong></p>
                        
                        <div style='margin: 40px 0; padding: 20px; border: 2px dashed #ffcccb; border-radius: 8px; background-color: #fff9f9;'>
                            <p style='font-size: 14px; color: #d9534f; font-weight: bold; margin-bottom: 15px;'>⚠️ WARNING: ONE-CLICK ACTION</p>
                            <p style='font-size: 14px; color: #666; margin-bottom: 20px;'>Only click the button below if you have physically received your items in good condition. Clicking it will instantly mark your order as Completed.</p>
                            <a href='$buttonLink' style='background-color: #C06C37; color: white; padding: 15px 30px; text-decoration: none; font-weight: bold; border-radius: 5px; display: inline-block; font-size: 16px;'>YES, I RECEIVED MY ORDER</a>
                        </div>
                        
                        <hr style='border: none; border-top: 1px solid #eee; margin: 30px 0;'>
                        <p style='font-size: 12px; color: #999;'>If the button doesn't work, copy and paste this link into your browser:<br>$buttonLink</p>
                    </div>";

                    $mail->send();
                } catch (Exception $e) {}
            }
        }
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false]);
    }
}
$conn->close();
?>