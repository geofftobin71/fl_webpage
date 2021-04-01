<?php
include $_SERVER['DOCUMENT_ROOT'] . '/php/shop-functions.php';
  
if($_SERVER["REQUEST_METHOD"] == "POST") {

  $total = cartTotal();
  
  if($total < 1) {
    $_SESSION["error"] = "Your cart is empty";
    header("Location:/cart/");
    exit;
  }
  
  if(isset($_SESSION["delivery-suburb"])) { $delivery_suburb = $_SESSION["delivery-suburb"]; }
  
  if(empty($delivery_suburb)) {
    $_SESSION["error"] = "Please choose a delivery option";
    header("Location:/cart/");
    exit;
  }
  
  if($delivery_suburb != "none") { $total += $delivery_fees[$delivery_suburb]; }
  
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
  
    $_SESSION["payment-intent-id"] = $payment_intent.id;
  }
  
  $output = [
    'publishableKey' => $stripe_keys['publishable_key'],
    'clientSecret' => $payment_intent->client_secret,
  ];
  
  echo json_encode($output);
}

?>
