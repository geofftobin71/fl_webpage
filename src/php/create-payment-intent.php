<?php
include $_SERVER['DOCUMENT_ROOT'] . '/php/shop-functions.php';
  
header('Content-Type: application/json');

$input = file_get_contents('php://input');
$body = json_decode($input, true);

if($_SERVER['REQUEST_METHOD'] !== 'POST' || json_last_error() !== JSON_ERROR_NONE) {
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

$description = "";
$descriptions = array();

foreach($cart as $cart_item) {
  $name = "";
  $product = getProduct($cart_item["product-id"]);
  if(isset($product)) {
    $name = $product["name"];
    $variant = getVariant($product, $cart_item["variant-id"]);
    if(isset($variant)) {
      $name .= " " . $variant["name"];
    }
    $descriptions[] = $name;
  }
}

$description = implode(", ", $descriptions);

try {
  if(isset($_SESSION["payment-intent-id"])) {
    $payment_intent = $stripe->paymentIntents->update(
      $_SESSION["payment-intent-id"],
      [
        "amount" => $total,
        "description" => $description,
      ]);
  } else {
    $payment_intent = $stripe->paymentIntents->create([
      "amount" => $total,
      "currency" => "nzd",
      "payment_method_types" => ["card"],
      "description" => $description,
    ]);

    $_SESSION["payment-intent-id"] = $payment_intent->id;
  }
} catch(Error $e) {
  http_response_code(500);
  echo json_encode(['error' => $e->getMessage()]);
}

$output = [
  'publishableKey' => $stripe_keys['publishable_key'],
  'clientSecret' => $payment_intent->client_secret,
];

echo json_encode($output);

?>
