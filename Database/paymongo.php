<?php
header('Content-Type: application/json');

$data = json_decode(file_get_contents("php://input"), true);
$amount = intval($data['amount'] * 100); 
$successUrl = $data['successUrl'];
$failedUrl = $data['failedUrl'];
$name = isset($data['name']) ? $data['name'] : 'Guest Customer';
$email = isset($data['email']) ? $data['email'] : 'guest@example.com';
$description = isset($data['description']) ? 'Order #' . $data['description'] : 'PACE Footwear Order';
$origin = isset($data['origin']) ? $data['origin'] : 'http://localhost/pace';

$deliveryFee = isset($data['deliveryFee']) ? floatval($data['deliveryFee']) : 0;
$deliveryType = isset($data['deliveryType']) ? $data['deliveryType'] : 'Shipping Fee';

$rawPhone = isset($data['phone']) ? $data['phone'] : '';
$cleanPhone = preg_replace('/[^0-9]/', '', $rawPhone);

if (substr($cleanPhone, 0, 2) === '63') {
    $cleanPhone = substr($cleanPhone, 2); 
}
elseif (substr($cleanPhone, 0, 1) === '0') {
    $cleanPhone = substr($cleanPhone, 1);
}

$secretKey = "sk_test_1njeE9ZAAXx8oZVCF297Xu4D"; 

$lineItems = [];
if (isset($data['items']) && is_array($data['items'])) {
    foreach ($data['items'] as $item) {
        $cleanPrice = floatval(str_replace(',', '', $item['price']));
        $itemAmountCentavos = intval($cleanPrice * 100); 
        
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

if ($deliveryFee > 0) {
    $lineItems[] = [
        'currency' => 'PHP',
        'amount' => intval($deliveryFee * 100),
        'name' => $deliveryType,
        'description' => 'Delivery Charge',
        'quantity' => 1
    ];
}

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
            'phone' => $cleanPhone
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