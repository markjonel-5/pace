<?php
// Connect to the database
require 'Database/pace-database.php';

$orderId = "";
$success = false;

// Check if the ID was passed in the URL
if (isset($_GET['id'])) {
    $orderId = $conn->real_escape_string($_GET['id']);
    
    // Update the database instantly!
    $sql = "UPDATE orders SET status = 'Completed' WHERE id = '$orderId'";
    if ($conn->query($sql) === TRUE) {
        $success = true;
    }
}
$conn->close();
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Completed | PACE</title>
    <link rel="stylesheet" href="global.css">
    <link rel="stylesheet" href="success-order.css">
</head>
<body>
    <div id="navbar-container"></div>

    <div class="success-page-container reveal">
        <div class="success-card">
            <?php if ($success): ?>
                <div class="success-icon-wrapper">
                    <i class="fi fi-rs-check-circle"></i>
                </div>

                <h1>Order Completed!</h1>
                <p class="success-subtitle">Thank you for confirming your delivery.</p>

                <div class="order-number-box">
                    <span>Order Number:</span>
                    <h3 id="display-order-id"><?php echo htmlspecialchars($orderId); ?></h3>
                </div>

                <p class="email-notice">Your transaction is officially complete. We hope you enjoy your new PACE items!</p>
                <div class="success-actions">
                    <a href="homepage.html" class="btn-primary">CONTINUE SHOPPING</a>
                </div>
            <?php else: ?>
                <div class="success-icon-wrapper" style="background-color: #fdedec; color: #e74c3c;">
                    <i class="fi fi-rs-cross-circle"></i>
                </div>
                <h1>Oops! Something went wrong.</h1>
                <p class="success-subtitle">We couldn't process that request.</p>
                <p class="email-notice">The link might be invalid, or your order has already been marked as completed.</p>
                <div class="success-actions">
                    <a href="homepage.html" class="btn-primary">BACK TO HOME</a>
                </div>
            <?php endif; ?>
        </div>
    </div>

    <div id="footer-container"></div>

    <script src="global.js"></script>
</body>
</html>