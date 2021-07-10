<?php
include $_SERVER['DOCUMENT_ROOT'] . '/php/shop-functions.php';

if($_SERVER["REQUEST_METHOD"] === "POST") {

  $delivery_option = clean($_POST["delivery-option"] ?? "none");
  $delivery_name = clean($_POST["delivery-name"] ?? "");
  $delivery_phone = clean($_POST["delivery-phone"] ?? "");
  $delivery_address = clean($_POST["delivery-address"] ?? "18 Cambridge Terrace");
  $delivery_suburb = clean($_POST["delivery-suburb"] ?? "Te Aro");
  $delivery_date = clean($_POST["delivery-date"] ?? "");
  $gift_tag_message = clean($_POST["gift-tag-message"] ?? "");
  $special_requests = clean($_POST["special-requests"] ?? "");
  $cardholder_name = clean($_POST["cardholder-name"] ?? "");
  $cardholder_phone = clean($_POST["cardholder-phone"] ?? "");
  $cardholder_email = clean($_POST["cardholder-email"] ?? "");
  $workshop_attendee_name = $_POST["workshop-attendee-name"];
  $workshop_attendee_email = $_POST["workshop-attendee-email"];
  $cart = json_decode($_POST["cart"] ?? "", true);
  $cart_total = floatVal(clean($_POST["cart-total-check"] ?? "0"));
  $delivery_fee = floatVal(clean($_POST["delivery-total-check"] ?? "0"));

  if(empty($delivery_option)) { header('Location:/shop-error/?p=' . obfencode('Error: Missing delivery_option')); exit; }
  if(empty($cardholder_name)) { header('Location:/shop-error/?p=' . obfencode('Error: Missing cardholder_name')); exit; }
  if(empty($cardholder_phone)) { header('Location:/shop-error/?p=' . obfencode('Error: Missing cardholder_phone')); exit; }
  if(empty($cardholder_email)) { header('Location:/shop-error/?p=' . obfencode('Error: Missing cardholder_email')); exit; }
  if(empty($cart)) { header('Location:/shop-error/?p=' . obfencode('Error: Missing cart')); exit; }
  if($cart_total < 1) { header('Location:/shop-error/?p=' . obfencode('Error: Zero cart total')); exit; }

  $order_date = new DateTime;

  $product_names = array();
  $variant_names = array();

  foreach($cart as $cart_item) {
    $product = getProduct($cart_item["product-id"]);
    $cart_id = $cart_item["cart-id"];
    if(isset($product)) {
      $product_names[$cart_id] = $product["name"];
      $variant = getVariant($product, $cart_item["variant-id"]);
      if(isset($variant)) {
        $variant_names[$cart_id] = $variant["name"];
      } else {
        $variant_names[$cart_id] = "";
      }
    }
  }

  $order_items = array();

  foreach($cart as $cart_item) {
    $product = getProduct($cart_item["product-id"]);
    $cart_id = $cart_item["cart-id"];
    if(isset($product)) {
      $category = getCategory($product["category"]);
      $price = getPrice($product, $cart_item["variant-id"]);
      if(isset($category)) {
        $order_items[] = array(
          "product" => $product_names[$cart_id],
          "variant" => $variant_names[$cart_id],
          "price" => $price,
        );
      }
    }
  }

  header('Content-Type: application/json');

  $YOUR_DOMAIN = 'http://168.138.10.72';

  $checkout_session = $stripe->checkout->sessions->create([
    'success_url' => $YOUR_DOMAIN . '/checkout-success/',
    'cancel_url' => $YOUR_DOMAIN . '/checkout/',
    'mode' => 'payment',
    'payment_method_types' => ['card'],
    'customer_email' => $cardholder_email,
    'line_items' => [[
      'price_data' => [
        'currency' => 'nzd',
        'unit_amount' => 2000,
        'product_data' => [
          'name' => 'Stubborn Attachments',
          'images' => ["https://i.imgur.com/EHyR2nP.png"],
        ],
      ],
      'quantity' => 1,
    ]],
    'payment_intent_data' => [
      'receipt_email' => $cardholder_email,
      'shipping' => [
        'name' => $delivery_name,
        'address' => [
          'line1' => '1234 Main Street',
          'city' => 'Wellington',
          'state' => 'CA',
          'country' => 'US',
          'postal_code' => '94111',
        ],
      ],
    ],
  ]);

  header("HTTP/1.1 303 See Other");
  header("Location: " . $checkout_session->url);
}
?>
