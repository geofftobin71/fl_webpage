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

$total_stock = 0;
$has_stock = false;

$stock_count = array();

$timeout = microtime(true) - $cart_expiry_time;

$product = getProduct($product_id);
if(isset($product)) {
  if(isset($product["stock"])) {
    $has_stock = true;

    $items = $stockStore->findBy([
      ["product-id", "=", $product_id],
      "AND",
      ["variant-id", "=", "none"],
      "AND",
      ["sold", "=", false],
      "AND",
      ["updated", "<", $timeout]
    ]);

    $stock_count["none"] = count($items);
    $total_stock += count($items);
  }

  if(isset($product["variants"])) {
    foreach($product["variants"] as $variant) {
      if(isset($variant["stock"])) {
        $has_stock = true;

        $items = $stockStore->findBy([
          ["product-id", "=", $product_id],
          "AND",
          ["variant-id", "=", $variant["id"]],
          "AND",
          ["sold", "=", false],
          "AND",
          ["updated", "<", $timeout]
        ]);

        $stock_count[strval($variant["id"])] = count($items);
        $total_stock += count($items);
      }
    }
  }

  if($has_stock) {
    $stock_count["total"] = $total_stock;
  } else {
    $stock_count["total"] = -1;
  }
}

echo json_encode(['stock-count' => $stock_count]);

?>
