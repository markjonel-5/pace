<?php
// Database/paymongo.php
header('Content-Type: application/json');

// 1. Get the frontend data
$data = json_decode(file_get_contents("php://input"), true);
$amount = intval($data['amount'] * 100); 
$successUrl = $data['successUrl'];
$failedUrl = $data['failedUrl'];
$name = isset($data['name']) ? $data['name'] : 'Guest Customer';
$email = isset($data['email']) ? $data['email'] : 'guest@example.com';
$description = isset($data['description']) ? 'Order #' . $data['description'] : 'PACE Footwear Order';
$origin = isset($data['origin']) ? $data['origin'] : 'http://localhost/pace';

// NEW: Get Delivery Info
$deliveryFee = isset($data['deliveryFee']) ? floatval($data['deliveryFee']) : 0;
$deliveryType = isset($data['deliveryType']) ? $data['deliveryType'] : 'Shipping Fee';

// NEW: Auto-Clean the Phone Number for PayMongo (Strips +63, spaces, and leading zeros)
$rawPhone = isset($data['phone']) ? $data['phone'] : '';
$cleanPhone = preg_replace('/[^0-9]/', '', $rawPhone); // e.g. "639123456789" or "09123456789"

// If it starts with '63', remove the '63'
if (substr($cleanPhone, 0, 2) === '63') {
    $cleanPhone = substr($cleanPhone, 2); 
} 
// If it starts with '0', remove the '0'
elseif (substr($cleanPhone, 0, 1) === '0') {
    $cleanPhone = substr($cleanPhone, 1);
}
// $cleanPhone is now exactly "9123456789"

// 2. Put your PayMongo TEST Secret Key here
$secretKey = "sk_test_RhxmhDCZxvqPJb78X3QhDZAE"; 

// 3. Build the Line Items dynamically from the cart
$lineItems = [];
if (isset($data['items']) && is_array($data['items'])) {
    foreach ($data['items'] as $item) {
        $cleanPrice = floatval(str_replace(',', '', $item['price']));
        $itemAmountCentavos = intval($cleanPrice * 100); 
        
        // MODIFIED: Removed Category, kept Size and Color
        $size = isset($item['size']) ? $item['size'] : 'N/A';
        $color = isset($item['color']) ? $item['color'] : 'N/A';
        $itemDescription = "Size: " . $size . " | Color: " . $color;

        $imageUrl = isset($item['image']) ? $item['image'] : '';
        if (strpos($imageUrl, 'http') !== 0) {
            $imageUrl = rtrim($origin, '/') . '/' . ltrim($imageUrl, '/');
        }

        $lineItems[] = [
            'currency' => 'PHP',
            'amount' => $itemAmountCentavos,
            'name' => $item['name'],
            'description' => $itemDescription, 
            'quantity' => isset($item['quantity']) ? intval($item['quantity']) : 1,
            'images' => [$imageUrl] 
        ];
    }
}

// NEW: Add the Delivery Fee to the PayMongo Receipt if it exists
if ($deliveryFee > 0) {
    $lineItems[] = [
        'currency' => 'PHP',
        'amount' => intval($deliveryFee * 100),
        'name' => $deliveryType,
        'description' => 'Delivery Charge',
        'quantity' => 1
    ];
}

// 4. Call PayMongo CHECKOUT SESSIONS API
$curl = curl_init();
curl_setopt_array($curl, [
  CURLOPT_URL => "https://api.paymongo.com/v1/checkout_sessions",
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_ENCODING => "",
  CURLOPT_MAXREDIRS => 10,
  CURLOPT_TIMEOUT => 30,
  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
  CURLOPT_CUSTOMREQUEST => "POST",
  CURLOPT_POSTFIELDS => json_encode([
    'data' => [
      'attributes' => [
        'billing' => [
            'name' => $name,
            'email' => $email,
            'phone' => $cleanPhone // Sends perfectly formatted 09... number!
        ],
        'send_email_receipt' => false,
        'show_description' => true,
        'show_line_items' => true,
        'cancel_url' => $failedUrl,
        'description' => $description,
        'line_items' => $lineItems, 
        'payment_method_types' => ['gcash'], 
        'success_url' => $successUrl
      ]
    ]
  ]),
  CURLOPT_HTTPHEADER => [
    "accept: application/json",
    "authorization: Basic " . base64_encode($secretKey . ":"),
    "content-type: application/json"
  ],
]);

$response = curl_exec($curl);
$err = curl_error($curl);
curl_close($curl);

if ($err) {
    echo json_encode(['error' => $err]);
} else {
    $resObj = json_decode($response, true);
    
    if (isset($resObj['data']['attributes']['checkout_url'])) {
        echo json_encode([
            'checkout_url' => $resObj['data']['attributes']['checkout_url']
        ]);
    } else {
        echo json_encode(['error' => 'Could not generate checkout link', 'details' => $resObj]);
    }
}
?>