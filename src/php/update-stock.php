<?php include "shop-functions.php" ?>

<?php

foreach($shop_products as $product) {
  if($product["variants"]) {
    foreach($product["variants"] as $variant) {
      if(isset($variant["stock"])) {
        $items = $stockStore->findBy([["product-id", "=", $product["id"]], "AND", ["variant-id", "=", $variant["id"]]]);
        for($x = 0; $x < (intVal($variant["stock"]) - count($items)); $x++) {
          $stockStore->insert([
            "stock-id" => uniqueId(),
            "product-id" => $product["id"],
            "variant-id" => $variant["id"],
            "updated" => microtime(true) - $cart_reset_time,
            "sold" => false
          ]);
        }
      }
    }
  } else {
    if(isset($product["stock"])) {
      $items = $stockStore->findBy([["product-id", "=", $product["id"]], "AND", ["variant-id", "=", "none"]]);
      for($x = 0; $x < (intVal($product["stock"]) - count($items)); $x++) {
        $stockStore->insert([
          "stock-id" => uniqueId(),
          "product-id" => $product["id"],
          "variant-id" => "none",
          "updated" => microtime(true) - $cart_reset_time,
          "sold" => false
        ]);
      }
    }
  }
}

?>
