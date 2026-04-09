<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

header('Content-Type: application/json');
require 'pace-database.php';
require 'PHPMailer/Exception.php';
require 'PHPMailer/PHPMailer.php';
require 'PHPMailer/SMTP.php';

$sql_create = "CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(50) PRIMARY KEY,
    customer_email VARCHAR(100),
    customer_name VARCHAR(100),
    order_date VARCHAR(50),
    status VARCHAR(50),
    total_amount VARCHAR(50),
    items LONGTEXT,
    payment_method VARCHAR(50),
    delivery_type VARCHAR(50),
    shipping_address LONGTEXT
)";
$conn->query($sql_create);

$data = json_decode(file_get_contents("php://input"), true);

if ($data) {
    $id = $conn->real_escape_string($data['id']);
    $customerEmail = $conn->real_escape_string($data['customerEmail']);
    $customerName = $conn->real_escape_string($data['customerName']);
    $date = $conn->real_escape_string($data['date']);
    $status = $conn->real_escape_string($data['status']);
    $totalAmount = $conn->real_escape_string($data['totalAmount']);
    $items = $conn->real_escape_string(json_encode($data['items']));
    $paymentMethod = $conn->real_escape_string($data['paymentMethod']);
    $deliveryType = $conn->real_escape_string($data['deliveryType']);
    $shippingAddress = $conn->real_escape_string(json_encode($data['shippingAddress']));

    $insert = "INSERT INTO orders (id, customer_email, customer_name, order_date, status, total_amount, items, payment_method, delivery_type, shipping_address)
               VALUES ('$id', '$customerEmail', '$customerName', '$date', '$status', '$totalAmount', '$items', '$paymentMethod', '$deliveryType', '$shippingAddress')";

    if ($conn->query($insert) === TRUE) {
        
        foreach ($data['items'] as $item) {
            $prodId = $conn->real_escape_string($item['productId']);
            $size = $item['size'];
            $qty = (int)$item['quantity'];

            $res = $conn->query("SELECT stock FROM products WHERE id = '$prodId'");
            if ($res->num_rows > 0) {
                $row = $res->fetch_assoc();
                $stockObj = json_decode($row['stock'], true);
                if (isset($stockObj[$size])) {
                    $stockObj[$size] -= $qty;
                    if ($stockObj[$size] < 0) $stockObj[$size] = 0; 
                    $newStockStr = $conn->real_escape_string(json_encode($stockObj));
                    $conn->query("UPDATE products SET stock = '$newStockStr' WHERE id = '$prodId'");
                }
            }
        }

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
            $mail->addAddress($customerEmail, $customerName);

            $mail->isHTML(true);
            $mail->Subject = "Order Confirmed: $id";
            
            $mail->Body = "
            <div style='font-family: Arial, sans-serif; padding: 20px; color: #333;'>
                <h2 style='color: #C06C37;'>Thank you for your order, $customerName!</h2>
                <p>We have successfully received your order <strong>$id</strong> placed on $date.</p>
                <p><strong>Total Amount:</strong> ₱" . number_format((float)$totalAmount, 2) . "</p>
                <p><strong>Payment Method:</strong> $paymentMethod</p>
                <p><strong>Delivery Type:</strong> $deliveryType</p>
                <hr style='border: none; border-top: 1px solid #eee; margin: 20px 0;'>
                <p>We are currently processing your items. We will send you another email as soon as your order is shipped or ready for pick-up!</p>
                <br>
                <p>Best regards,<br><strong>The PACE Team</strong></p>
            </div>";

            $mail->send();
        } catch (Exception $e) { }

        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'message' => $conn->error]);
    }
}
$conn->close();
?>