<?php
include $_SERVER['DOCUMENT_ROOT'] . '/php/shop-functions.php';

header('Content-Type: application/json');

$YOUR_DOMAIN = 'http://168.138.10.72';

$checkout_session = $stripe->checkout->sessions->create([
  'payment_method_types' => ['card'],
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
  'mode' => 'payment',
  'success_url' => $YOUR_DOMAIN . '/checkout-success/',
  'cancel_url' => $YOUR_DOMAIN . '/checkout-cancel/',
]);

header("HTTP/1.1 303 See Other");
header("Location: " . $checkout_session->url);
?>
