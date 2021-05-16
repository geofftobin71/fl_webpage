<?php
include $_SERVER['DOCUMENT_ROOT'] . '/php/shop-functions.php';
  
// header('Content-Type: application/json');

$input = file_get_contents('php://input');
$body = json_decode($input, true);

if($_SERVER['REQUEST_METHOD'] !== 'POST' || json_last_error() !== JSON_ERROR_NONE) {
  echo json_encode(['error' => 'Invalid request']);
  exit;
}

$cart = $body["cart"];
$cart_total_check = intVal($body["cart-total-check"]);
$delivery_total_check = intVal($body["delivery-total-check"]);
$delivery_option = clean($body["delivery-option"]);
$delivery_name = clean($body["delivery-name"]);
$delivery_phone = clean($body["delivery-phone"]);
$delivery_address = clean($body["delivery-address"]);
$delivery_suburb = clean($body["delivery-suburb"]);
$delivery_date = clean($body["delivery-date"]);
$gift_tag_message = clean($body["gift-tag-message"]);
$special_requests = clean($body["special-requests"]);
$cardholder_name = clean($body["cardholder-name"]);
$cardholder_email = clean($body["cardholder-email"]);
$workshop_attendee_name = $body["workshop-attendee-name"];
$workshop_attendee_email = $body["workshop-attendee-email"];

$total = cartTotal($cart);

if($total < 1) {
  echo json_encode(['error' => 'Your cart is empty']);
  exit;
}

if($total !== $cart_total_check) {
  echo json_encode(['error' => 'Cart total error']);
  exit;
}

if(!isset($delivery_option)) {
  echo json_encode(['error' => 'Invalid Delivery Option']);
  exit;
} else {
  if(empty($delivery_option)) {
    echo json_encode(['error' => 'Invalid Delivery Option']);
    exit;
  }
}

if(!isset($delivery_suburb)) {
  echo json_encode(['error' => 'Invalid Delivery Suburb']);
  exit;
}

if(!isset($delivery_date)) {
  echo json_encode(['error' => 'Invalid Delivery Date']);
  exit;
}

if(strtolower($delivery_option) === "delivery") {

  if(empty($delivery_suburb)) {
    echo json_encode(['error' => 'Invalid Delivery Suburb']);
    exit;
  }

  if(empty($delivery_date)) {
    echo json_encode(['error' => 'Invalid Delivery Date']);
    exit;
  }

  $delivery_fee = $delivery_fees[strtolower($delivery_suburb)];

  if(str_starts_with($delivery_date, "Saturday")) {
    $delivery_fee = ($delivery_fee < 20) ? 20 : $delivery_fee;
  }

  foreach($flat_rate_delivery_fees as $date => $value) {
    if(str_ends_with($delivery_date, $date)) {
      $fee = intVal($value);
      if($fee === 0) {
        $delivery_fee = $fee;
      } else {
        $delivery_fee = ($delivery_fee < $fee) ? $fee : $delivery_fee;
      }
    }
  }

  if($delivery_fee !== $delivery_total_check) {
    echo json_encode(['error' => 'Delivery total error']);
    exit;
  }

  $total = $total + $delivery_fee;
}

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

$description = implode(",", $descriptions);

$shipping = [
  "name" => $delivery_name,
  "phone" => $delivery_phone,
  "address" => [
    "line1" => $delivery_address,
    "line2" => $delivery_suburb,
    "city" => "Wellington",
    "country" => "NZ"
  ]
];

$metadata = [
  "delivery-option" => $delivery_option,
  "delivery-name" => $delivery_name,
  "delivery-phone" => $delivery_phone,
  "delivery-address" => $delivery_address,
  "delivery-suburb" => $delivery_suburb,
  "delivery-date" => $delivery_date,
  "gift-tag-message" => $gift_tag_message,
  "special-requests" => $special_requests,
  "cardholder-name" => $cardholder_name,
  "cardholder-email" => $cardholder_email,
  "workshop-attendee-name" => implode(",", $workshop_attendee_name),
  "workshop-attendee-email" => implode(",", $workshop_attendee_email),
];

echo "<pre>";
print_r($shipping);
print_r($metadata);
echo "/<pre>";

exit;

/* FIXME
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
      "receipt_email" => $cardholder_email,
      "shipping" => $shipping,
    ]);

    $_SESSION["payment-intent-id"] = $payment_intent->id;
  }
} catch(Error $e) {
  echo json_encode(['error' => $e->getMessage()]);
  exit;
}
 */

echo json_encode(['clientSecret' => 'pi_1Il2WdLjelSQaoWrC9vtnVSv_secret_YNdFdbKvnXg1sV3xdPzluUreq']); // FIXME $payment_intent->client_secret]);

?>
