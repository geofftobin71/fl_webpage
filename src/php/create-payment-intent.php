<?php
include $_SERVER['DOCUMENT_ROOT'] . '/php/shop-functions.php';
  
header('Content-Type: application/json');

$input = file_get_contents('php://input');
$body = json_decode($input, true);

if($_SERVER['REQUEST_METHOD'] === 'POST' || json_last_error() !== JSON_ERROR_NONE) {
  http_response_code(400);
  echo json_encode(['error' => 'Invalid request']);
  exit;
}

$cart = $body["cart"];
$delivery_suburb = strtolower($body["delivery-suburb"]);

$total = cartTotal($cart);

if($total < 1) {
  http_response_code(400);
  echo json_encode(['error' => 'Your cart is empty']);
  exit;
}

if(isset($delivery_suburb) && ($delivery_suburb != "none")) { $total += $delivery_fees[$delivery_suburb]; }

$total = $total * 100;

if(isset($_SESSION["payment-intent-id"])) {
  $payment_intent = $stripe->paymentIntents->update(
    $_SESSION["payment-intent-id"],
    [
      "amount" => $total,
    ]);
} else {
  $payment_intent = $stripe->paymentIntents->create([
    "amount" => $total,
    "currency" => "nzd",
    "payment_method_types" => ["card"],
  ]);

  $_SESSION["payment-intent-id"] = $payment_intent->id;
}

$output = [
  'publishableKey' => $stripe_keys['publishable_key'],
  'clientSecret' => $payment_intent->client_secret,
  'paymentIntentId' => $payment_intent->id,
];

echo json_encode($output);

?>
