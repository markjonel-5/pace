<?php
header('Content-Type: application/json');
require 'pace-database.php';

$data = json_decode(file_get_contents("php://input"), true);

if (!$data || !isset($data['action']) || !isset($data['email'])) {
    echo json_encode(['success' => false, 'message' => 'Invalid data.']);
    exit;
}

$action = $data['action'];
$email = $conn->real_escape_string($data['email']);

// ACTION 1: UPDATE PROFILE INFO & PASSWORD
if ($action === 'update_profile') {
    $fname = $conn->real_escape_string($data['firstName']);
    $lname = $conn->real_escape_string($data['lastName']);
    $phone = $conn->real_escape_string($data['phone']);
    $username = $conn->real_escape_string($data['username']);

    if (!empty($data['currentPassword']) && !empty($data['newPassword'])) {
        $check = $conn->query("SELECT password FROM users WHERE email='$email'");
        if ($check->num_rows > 0) {
            $user = $check->fetch_assoc();
            if (password_verify($data['currentPassword'], $user['password'])) {
                $newPassHash = password_hash($data['newPassword'], PASSWORD_DEFAULT);
                $sql = "UPDATE users SET first_name='$fname', last_name='$lname', phone='$phone', username='$username', password='$newPassHash' WHERE email='$email'";
            } else {
                echo json_encode(['success' => false, 'message' => 'wrong_password']);
                exit;
            }
        }
    } else {
        $sql = "UPDATE users SET first_name='$fname', last_name='$lname', phone='$phone', username='$username' WHERE email='$email'";
    }

    if ($conn->query($sql) === TRUE) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'message' => $conn->error]);
    }
}
// ACTION 2: UPLOAD PROFILE PICTURE
elseif ($action === 'update_photo') {
    $photo = $conn->real_escape_string($data['photo']);
    if ($conn->query("UPDATE users SET profile_pic='$photo' WHERE email='$email'") === TRUE) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'message' => $conn->error]);
    }
}
// ACTION 3: DELETE PROFILE PICTURE
elseif ($action === 'delete_photo') {
    if ($conn->query("UPDATE users SET profile_pic=NULL WHERE email='$email'") === TRUE) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'message' => $conn->error]);
    }
}
// ACTION 4: SAVE ADDRESSES
elseif ($action === 'update_addresses') {
    $addresses = $conn->real_escape_string(json_encode($data['addresses']));
    if ($conn->query("UPDATE users SET addresses='$addresses' WHERE email='$email'") === TRUE) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'message' => $conn->error]);
    }
}
// ACTION 5: SAVE PAYMENT METHODS
elseif ($action === 'update_payments') {
    $payments = $conn->real_escape_string(json_encode($data['payments']));
    if ($conn->query("UPDATE users SET payment_methods='$payments' WHERE email='$email'") === TRUE) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'message' => $conn->error]);
    }
}
// ACTION 6: SAVE CART
elseif ($action === 'update_cart') {
    $cart = $conn->real_escape_string(json_encode($data['cart']));
    if ($conn->query("UPDATE users SET cart='$cart' WHERE email='$email'") === TRUE) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'message' => $conn->error]);
    }
}
// ACTION 7: SAVE WISHLIST
elseif ($action === 'update_wishlist') {
    $wishlist = $conn->real_escape_string(json_encode($data['wishlist']));
    if ($conn->query("UPDATE users SET wishlist='$wishlist' WHERE email='$email'") === TRUE) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'message' => $conn->error]);
    }
}
// ACTION 8: SAVE NOTIFICATIONS
elseif ($action === 'update_notifications') {
    $notifications = $conn->real_escape_string(json_encode($data['notifications']));
    if ($conn->query("UPDATE users SET notifications='$notifications' WHERE email='$email'") === TRUE) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'message' => $conn->error]);
    }
}
// ACTION 9: SAVE CHAT HISTORY
elseif ($action === 'update_chat') {
    $chat = $conn->real_escape_string(json_encode($data['chat']));
    if ($conn->query("UPDATE users SET chatHistory='$chat' WHERE email='$email'") === TRUE) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'message' => $conn->error]);
    }
}

// ACTION 10: SAVE ORDER HISTORY
elseif ($action === 'update_order_history') {
    $orderHistory = $conn->real_escape_string(json_encode($data['orderHistory']));
    if ($conn->query("UPDATE users SET orderHistory='$orderHistory' WHERE email='$email'") === TRUE) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'message' => $conn->error]);
    }
}
?>