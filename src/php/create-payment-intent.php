<?php
include $_SERVER['DOCUMENT_ROOT'] . '/php/shop-functions.php';
  
header('Content-Type: application/json');

$input = file_get_contents('php://input');
$body = json_decode($input, true);

if($_SERVER['REQUEST_METHOD'] !== 'POST' || json_last_error() !== JSON_ERROR_NONE) {
  echo json_encode(['error' => 'Invalid request']);
  exit;
}

$cart = $body["cart"];
$cart_total_check = intVal($body["cart-total-check"]);
$delivery_total_check = intVal($body["delivery-total-check"]);
$total = cartTotal($cart);

if($total < 1) {
  echo json_encode(['error' => 'Your cart is empty']);
  exit;
}

if($total !== $cart_total_check) {
  echo json_encode(['error' => 'Cart total error']);
  exit;
}

$delivery_option = strtolower($body["delivery-option"]);
$delivery_suburb = strtolower($body["delivery-suburb"]);
$delivery_date = $body["delivery-date"];

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

if($delivery_option === "delivery") {

  if(empty($delivery_suburb)) {
    echo json_encode(['error' => 'Invalid Delivery Suburb']);
    exit;
  }

  if(empty($delivery_date)) {
    echo json_encode(['error' => 'Invalid Delivery Date']);
    exit;
  }

  $delivery_fee = $delivery_fees[$delivery_suburb];

  if(str_starts_with($delivery_date, "Saturday")) {
    $delivery_fee = ($delivery_fee < 20) ? 20 : $delivery_fee;
  }

  foreach ($flat_rate_delivery_fees as $date => $value) {
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

$description = implode(", ", $descriptions);

// FIXME Possibly truncate the description with elipses

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
    ]);

    $_SESSION["payment-intent-id"] = $payment_intent->id;
  }
} catch(Error $e) {
  echo json_encode(['error' => $e->getMessage()]);
}
 */

$output = [
  'clientSecret' => 'pi_1Il2WdLjelSQaoWrC9vtnVSv_secret_YNdFdbKvnXg1sV3xdPzluUreq' // FIXME $payment_intent->client_secret,
];

echo json_encode($output);

?>
