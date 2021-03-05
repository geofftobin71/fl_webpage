<?php include $_SERVER['DOCUMENT_ROOT'] . '/php/shop-functions.php'; ?>

<?php

$product_id = "";
$variant_id = "";
$product_count = 1;
$stock_count = 1;
$return_url = "";

$page = "Add to Cart";

if($_SERVER["REQUEST_METHOD"] == "POST") {

  $product_id = clean($_POST["product_id"]);
  if(empty($product_id)) { criticalError($page, "No Product ID"); }

  $variant_id = clean($_POST["variant_id"]);
  if(empty($variant_id)) { criticalError($page, "No Variant ID"); }

  $return_url = clean($_POST["return_url"]);
  if(empty($return_url)) { criticalError($page, "No Return URL"); }

  $product_count = intval(clean($_POST["product_count"]));
  $product_count = ($product_count < 1) ? 1 : $product_count;

  if(isFinite($product_id, $variant_id)) {
    $stock_count = stockCount($product_id, $variant_id);

    if($product_count > $stock_count) {
      header("Location:" . $return_url . "?error=Number must be less than or equal to " . $stock_count . "#add-to-cart-form");
    }
  }

  echo 'Product ID: ' . $_POST["product_id"] . '<br>';
  echo 'Variant ID: ' . $_POST["variant_id"] . '<br>';
  echo 'Product count: ' . $_POST["product_count"] . '<br>';
  echo 'Return URL: ' . $_POST["return_url"] . '<br>';
  
}

?>
