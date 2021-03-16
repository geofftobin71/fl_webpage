<?php include $_SERVER["DOCUMENT_ROOT"] . "/php/shop-functions.php"; ?>

<?php

$product_id = "";
$variant_id = "";
$product_count = 0;
$return_url = "";

$page = "Add to Cart";

if($_SERVER["REQUEST_METHOD"] == "POST") {

  if(isset($_POST["product-id"])) { $product_id = clean($_POST["product-id"]); }
  if(empty($product_id)) { criticalError($page, "No Product ID"); }

  if(isset($_POST["variant-id"])) { $variant_id = clean($_POST["variant-id"]); }
  if(empty($variant_id)) { criticalError($page, "No Variant ID"); }

  if(isset($_POST["return-url"])) { $return_url = clean($_POST["return-url"]); }
  if(empty($return_url)) { criticalError($page, "No Return URL"); }

  if(isset($_POST["product-count"])) { $product_count = intval(clean($_POST["product-count"])); }
  $product_count = ($product_count < 1) ? 1 : $product_count;

  $_SESSION["product-id"] = $product_id;
  $_SESSION["variant-id"] = $variant_id;
  $_SESSION["product-count"] = $product_count;

  if(isUnique($product_id, $variant_id)) {
    $stock_count = stockCount($product_id, $variant_id);

    if($product_count > $stock_count) {
      $_SESSION["product-count"] = $stock_count;
      $_SESSION["error"] = "Number must be less than or equal to " . $stock_count;
      header("Location:" . $return_url . "#add-to-cart-form");
      exit;
    }
  }

  $items_added = 0;

  for($i = 0; $i < $product_count; $i++) {
    $item = findStock($product_id, $variant_id);

    if($item) {
      if($item["unique"]) {
        $item["updated"] = (new DateTime)->getTimestamp();

        $stockStore->update($item);
      }

      $_SESSION["cart"][] = array(
        "id" => $item["id"],
        "product" => $item["product"],
        "variant" => $item["variant"],
        "updated" => $item["updated"],
        "unique" => $item["unique"],
        "sold" => $item["sold"]
      );

      $items_added++;
    }
  }

  if($items_added == $product_count) {
    unset($_SESSION["error"]);
    $_SESSION["info"] = $items_added . ($items_added == 1 ? " item was" : " items were") . " added to your cart";
  } else {
    unset($_SESSION["info"]);
    $_SESSION["error"] = $items_added . " of " . $product_count . " items could be added to your cart";
  }

  unset($_SESSION["product-id"]);
  unset($_SESSION["variant-id"]);
  unset($_SESSION["product-count"]);

  header("Location:/cart/");
  exit;
}

?>
