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
$cart_items = "";
$cart_total = 0;

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

          $cart_items .= '<div class="font-base font-size--1" style="display:flex;justify-content:flex-start">';
          $cart_items .= '<a class="icon-button" href="/php/remove-from-cart.php?i=' . $i . '">';
          $cart_items .= '<span><svg viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg"><path d="M704 736v576q0 14-9 23t-23 9h-64q-14 0-23-9t-9-23v-576q0-14 9-23t23-9h64q14 0 23 9t9 23zm256 0v576q0 14-9 23t-23 9h-64q-14 0-23-9t-9-23v-576q0-14 9-23t23-9h64q14 0 23 9t9 23zm256 0v576q0 14-9 23t-23 9h-64q-14 0-23-9t-9-23v-576q0-14 9-23t23-9h64q14 0 23 9t9 23zm128 724v-948h-896v948q0 22 7 40.5t14.5 27 10.5 8.5h832q3 0 10.5-8.5t14.5-27 7-40.5zm-672-1076h448l-48-117q-7-9-17-11h-317q-10 2-17 11zm928 32v64q0 14-9 23t-23 9h-96v948q0 83-47 143.5t-113 60.5h-832q-66 0-113-58.5t-47-141.5v-952h-96q-14 0-23-9t-9-23v-64q0-14 9-23t23-9h309l70-167q15-37 54-63t79-26h320q40 0 79 26t54 63l70 167h309q14 0 23 9t9 23z"/></svg></span><p class="text-lowercase">Remove</p>';
          $cart_items .= '</a>';
          $cart_items .= '</div>';
          $cart_items .= '</div>';
          $cart_items .= '<p class="text-right">' . formatMoney($price) . '</p>';

          $i++;
        }

echo json_encode(['cart-items' => $cart_items]);

?>
