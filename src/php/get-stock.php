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

$product_id = $body["product-id"];
$variant_id = $body["variant-id"];
$product_count = intval($body["product-count"]);

$stock_count = stockCount($product_id, $variant_id);

if(($stock_count > 0) && ($product_count > $stock_count)) {
  echo json_encode(['error' => 'Number must be ' . $stock_count . ' or less']);
  exit;
}

if($stock_count == 0) {
  echo json_encode(['error' => 'This product has sold out']);
  exit;
}

$cart = array();

$items = acquireStock($product_id, $variant_id, $product_count);

if($items) {
  foreach($items as $key => $item) {
    $cart[] = array(
      "cart-id" => uniqueId(),
      "product-id" => $item["product-id"],
      "variant-id" => $item["variant-id"],
      "stock-id" => $item["stock-id"],
      "updated" => $item["updated"]
    );
  }
} else {
  echo json_encode(['error' => 'Not enough stock available']);
  exit;
}

echo json_encode(['cart' => $cart]);

?>
