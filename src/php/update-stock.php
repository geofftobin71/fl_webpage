<?php include "shop-functions.php" ?>

<?php

foreach($shop_products as $product) {
  if($product["variants"]) {
    foreach($product["variants"] as $variant) {
      if($variant["stock"]) {
        $items = $stockStore->findBy([["product", "=", $product["id"]], "AND", ["variant", "=", $variant["id"]]]);
        for($x = 0; $x < (intVal($variant["stock"]) - count($items)); $x++) {
          $stockStore->insert([
            "stock-id" => uniqueId(),
            "product-id" => $product["id"],
            "variant-id" => $variant["id"],
            "updated" => (new DateTime)->modify("-30 minutes")->getTimestamp(),
            "sold" => false
          ]);
        }
      }
    }
  } else {
    if($product["stock"]) {
      $items = $stockStore->findBy([["product", "=", $product["id"]], "AND", ["variant", "=", "none"]]);
      for($x = 0; $x < (intVal($product["stock"]) - count($items)); $x++) {
        $stockStore->insert([
          "stock-id" => uniqueId(),
          "product-id" => $product["id"],
          "variant-id" => "none",
          "updated" => (new DateTime)->modify("-30 minutes")->getTimestamp(),
          "sold" => false
        ]);
      }
    }
  }
}

?>
