<?php
include $_SERVER["DOCUMENT_ROOT"] . "/php/shop-functions.php";

header('Content-Type: application/json');

$input = file_get_contents('php://input');
$body = json_decode($input, true);

if($_SERVER['REQUEST_METHOD'] !== 'POST' || json_last_error() !== JSON_ERROR_NONE) {
  http_response_code(400);
  echo json_encode(['error' => 'Invalid request']);
  exit;
}

$cart = $body["cart"];
$delivery_suburb = $body["delivery-suburb"];
$cart_count = count($cart);
$cart_items = "";
$cart_summary = "";
$cart_total = 0;
$delivery_fee = ($delivery_suburb && $delivery_suburb != "none") ? $delivery_fees[$delivery_suburb] : 0;

$i = 0;
foreach($cart as $cart_item) {
  $product = getProduct($cart_item["product-id"]);
  $price = getPrice($product, $cart_item["variant-id"]);
  $cart_total += $price;

  $cart_items .= '<div class="stack" style="--stack-space:1em">';
  $cart_items .= '<p>' . $product["name"];

  if(hasVariants($product)) {
    $variant = getVariant($product, $cart_item["variant-id"]);
    $cart_items .= '<span class="font-size--1" style="white-space:nowrap"> ( ' . $variant["name"] . ' )</span>';
  }

  $cart_items .= '</p>';

  if(strtolower($product["category"]) == "workshops") {
    $cart_items .= '<div>';
    $cart_items .= '<label for="ws-name-' . $i . '"><h4 class="heading">Name</h4></label>';
    $cart_items .= '<input class="input" style="width:100%" id="ws-name-' . $i . '" name="workshop-attendee-name[' . $cart_item['cart-id'] . ']" type="text" autocomplete="name" placeholder="Name of the person attending">';
    $cart_items .= '</div>';
    $cart_items .= '<div>';
    $cart_items .= '<label for="ws-email-' . $i . '"><h4 class="heading">Email</h4></label>';
    $cart_items .= '<input class="input" style="width:100%" id="ws-email-' . $i . '" name="workshop-attendee-email[' . $cart_item['cart-id'] . ']" type="email" autocomplete="email" inputmode="email" placeholder="Email of the person attending">';
    $cart_items .= '<p class="caption text-left text-lowercase">We will send a sign-up confirmation email to this address</p>';
    $cart_items .= '</div>';
  }

  $cart_items .= '</div>';
  $cart_items .= '<p class="text-right">' . formatMoney($price) . '</p>';

  $i++;
}

$cart_summary .= '<h3 class="heading text-left">Cart Total</h3>';
$cart_summary .= '<p>' . $cart_count . ($cart_count == 1 ? ' item' : ' items') . '</p>';
$cart_summary .= '<p>' . formatMoney($cart_total) . '</p>';

if(cartHasDelivery($cart)) {
  $cart_summary .= '<h3 class="heading text-left" style="grid-column:1/span 2">';
  if(($delivery_suburb != "none") && ($delivery_suburb != "pickup in store")) { $cart_summary .= 'Delivery to '; }
  $cart_summary .= '<span style="white-space:nowrap">' . $delivery_suburb . '<span></h3>';
  $cart_summary .= '<p id="delivery-fee">';
  if($delivery_suburb != "none") { $cart_summary .= formatMoney($delivery_fee); } else { $cart_summary .= "TBC"; } 
  $cart_summary .= '</p>';
  $cart_summary .= '<input id="delivery-suburb" name="delivery-suburb" type="hidden" value="' . $delivery_suburb . '">';
} else {
  $cart_summary .= '<input id="delivery-suburb" name="delivery-suburb" type="hidden" value="none">';
}

$cart_summary .= '<h3 class="top-border font-size-1 text-lowercase text-left">TOTAL</h3>';
$cart_summary .= '<p class="top-border"></p>';
$cart_summary .= '<p id="total" class="top-border font-size-1">' . formatMoney($delivery_fee + $cart_total) . '</p>';

echo json_encode([
  'cart-items' => $cart_items,
  'cart-summary' => $cart_summary
]);

?>
