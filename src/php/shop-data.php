<?php
include $_SERVER["DOCUMENT_ROOT"] . "/php/shop-functions.php";

header('Content-Type: application/json');

echo json_encode([
  "shop-products" => $shop_products,
  "shop-categories" => $shop_categories,
  "delivery-fees" => $delivery_fees,
  "flat-rate-delivery-fees" => $flat_rate_delivery_fees,
  "non-delivery-dates" => $non_delivery_dates,
  "shop-closed-dates" => $shop_closed_dates,
  "shop-hours" => $shop_hours,
  "special-delivery-dates" => $special_delivery_dates,
  "special-shop-open-dates" => $special_shop_open_dates,
]);

?>
