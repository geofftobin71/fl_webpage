<?php include "shop-functions.php" ?>

<?php

foreach($shop_products as $product) {
  if($product["variants"]) {
    foreach($product["variants"] as $variant) {
      if($variant["stock"]) {
        $items = $stockStore->findBy([["product", "=", $product["id"]], "AND", ["variant", "=", $variant["id"]], "AND", ["unique", "=", true]]);
        for($x = 0; $x < (intVal($variant["stock"]) - count($items)); $x++) {
          $stockStore->insert([
            "id" => uniqueId(),
            "product" => $product["id"],
            "variant" => $variant["id"],
            "updated" => (new DateTime)->modify("-30 minutes")->getTimestamp(),
            "unique" => true,
            "sold" => false
          ]);
        }
      } else {
        $items = $stockStore->findBy([["product", "=", $product["id"]], "AND", ["variant", "=", $variant["id"]], "AND", ["unique", "=", false]]);
        if(count($items) == 0) {
          $stockStore->insert([
            "id" => uniqueId(),
            "product" => $product["id"],
            "variant" => $variant["id"],
            "updated" => (new DateTime)->modify("-30 minutes")->getTimestamp(),
            "unique" => false,
            "sold" => false
          ]);
        }
      }
    }
  } else {
    if($product["stock"]) {
      $items = $stockStore->findBy([["product", "=", $product["id"]], "AND", ["variant", "=", "none"], "AND", ["unique", "=", true]]);
      for($x = 0; $x < (intVal($product["stock"]) - count($items)); $x++) {
        $stockStore->insert([
          "id" => uniqueId(),
          "product" => $product["id"],
          "variant" => "none",
          "updated" => (new DateTime)->modify("-30 minutes")->getTimestamp(),
          "unique" => true,
          "sold" => false
        ]);
      }
    } else {
      $items = $stockStore->findBy([["product", "=", $product["id"]], "AND", ["variant", "=", "none"], "AND", ["unique", "=", false]]);
      if(count($items) == 0) {
        $stockStore->insert([
          "id" => uniqueId(),
          "product" => $product["id"],
          "variant" => "none",
          "updated" => (new DateTime)->modify("-30 minutes")->getTimestamp(),
          "unique" => false,
          "sold" => false
        ]);
      }
    }
  }
}

?>
