<?php include "shop-admin-pre.php" ?>

<?php $title = "Floriade Shop Stock"; ?>
<?php include "shop-admin-head.php" ?>

<body>
  <main>
  <h1><?php echo $title; ?></h1>
  <pre>

<?php

$products = json_decode(file_get_contents("shop_products.json"), true);

foreach($products as $product) {
  if($product['variants']) {
    foreach($product['variants'] as $variant) {
      if($variant['stock']) {
        $items = $stockStore->findBy([["product", "=", $product['id']], "AND", ["variant", "=", $variant['id']], "AND", ["unique", "=", true]]);
        for($x = 0; $x < (intVal($variant['stock']) - count($items)); $x++) {
          $stockStore->insert([
            "id" => uniqueId(),
            "product" => $product['id'],
            "variant" => $variant['id'],
            "updated" => new DateTime,
            "cart" => null,
            "unique" => true,
            "sold" => false
          ]);
        }
      } else {
        $items = $stockStore->findBy([["product", "=", $product['id']], "AND", ["variant", "=", $variant['id']], "AND", ["unique", "=", false]]);
        if(count($items) == 0) {
          $stockStore->insert([
            "id" => uniqueId(),
            "product" => $product['id'],
            "variant" => $variant['id'],
            "updated" => new DateTime,
            "cart" => null,
            "unique" => false,
            "sold" => false
          ]);
        }
      }
    }
  } else {
    if($product['stock']) {
      $items = $stockStore->findBy([["product", "=", $product['id']], "AND", ["variant", "=", "none"], "AND", ["unique", "=", true]]);
      for($x = 0; $x < (intVal($product['stock']) - count($items)); $x++) {
        $stockStore->insert([
          "id" => uniqueId(),
          "product" => $product['id'],
          "variant" => "none",
          "updated" => new DateTime,
          "cart" => null,
          "unique" => true,
          "sold" => false
        ]);
      }
    } else {
      $items = $stockStore->findBy([["product", "=", $product['id']], "AND", ["variant", "=", "none"], "AND", ["unique", "=", false]]);
      if(count($items) == 0) {
        $stockStore->insert([
          "id" => uniqueId(),
          "product" => $product['id'],
          "variant" => "none",
          "updated" => new DateTime,
          "cart" => null,
          "unique" => false,
          "sold" => false
        ]);
      }
    }
  }
}

foreach($products as $product) {
  echo $product['name'] . '<br>';
  $items = $stockStore->findBy([["product", "=", $product['id']], "AND", ["variant", "=", "none"]]);
  foreach($items as $item) {
    echo '&nbsp;&nbsp;' . $item['id'] . ' ' . (int)$item['unique'] . '<br>';
  }
  echo '<br>';

  foreach($product['variants'] as $variant) {
    echo '&nbsp;&nbsp;' . $variant['name'] . '<br>';
    $items = $stockStore->findBy([["product", "=", $product['id']], "AND", ["variant", "=", $variant['id']]]);
    foreach($items as $item) {
      echo '&nbsp;&nbsp;&nbsp;&nbsp;' . $item['id'] . ' ' . (int)$item['unique'] . '<br>';
    }
    echo '<br>';
  }
}

?>

  </pre>
  </main>
</body>
</html>

