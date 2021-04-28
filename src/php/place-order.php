<?php
include $_SERVER["DOCUMENT_ROOT"] . "/php/shop-functions.php";

function clean($data) {
  $data = trim($data);
  $data = stripslashes($data);
  $data = htmlspecialchars($data);
  return $data;
}

if($_SERVER["REQUEST_METHOD"] === "POST") {

  print_r($_POST);

  if(isset($_POST["payment-intent-id"])) { $payment_intent_id = clean($_POST["payment-intent-id"]); }
  if(isset($_POST["delivery-name"])) { $delivery_name = clean($_POST["delivery-name"]); }
  if(isset($_POST["delivery-phone"])) { $delivery_phone = clean($_POST["delivery-phone"]); }
  if(isset($_POST["delivery-address"])) { $delivery_address = clean($_POST["delivery-address"]); }
  if(isset($_POST["delivery-suburb"])) { $delivery_suburb = clean($_POST["delivery-suburb"]); }
  if(isset($_POST["delivery-date"])) { $delivery_date = clean($_POST["delivery-date"]); }
  if(isset($_POST["gift-tag-message"])) { $gift_tag_message = clean($_POST["gift-tag-message"]); }
  if(isset($_POST["special-requests"])) { $special_requests = clean($_POST["special-requests"]); }
  if(isset($_POST["cardholder-name"])) { $cardholder_name = clean($_POST["cardholder-name"]); }
  if(isset($_POST["cardholder-email"])) { $cardholder_email = clean($_POST["cardholder-email"]); }
  if(isset($_POST["workshop-attendee-name"])) { $workshop_attendee_name = clean($_POST["workshop-attendee-name"]); }
  if(isset($_POST["workshop-attendee-email"])) { $workshop_attendee_email = clean($_POST["workshop-attendee-email"]); }
  if(isset($_POST["cart"])) { $cart = clean($_POST["cart"]); }

/*
$orderStore->insert([
  "payment-id" => uniqueId(),
  "product-id" => $product["id"],
  "variant-id" => $variant["id"],
  "updated" => microtime(true) - $cart_reset_time,
  "sold" => false
]);
 */
}

?>
