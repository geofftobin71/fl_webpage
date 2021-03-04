<?php include "shop-admin-pre.php" ?>
<?php

$product_id = $price = 0;
$nameError = $priceError = $productError = "";

if(isset($_GET["product"])) { 
    $product_id = intval(clean($_GET["product"])); 
    if($product_id == 0) { $productError = "Invalid Product"; }
}

$name = "";
// $sort = (count($variantStore->findBy(["product", "=", $product_id])) + 1) * 10;
$sort = 0;
foreach($variantStore->findBy(["product", "=", $product_id]) as $variant) {
    $new_sort = intval($variant["sort"]);
    $sort = $new_sort > $sort ? $new_sort : $sort;
}
$sort += 10;
$disabled = false;

if($_SERVER["REQUEST_METHOD"] == "POST") {
  if(empty($_POST["name"])) {
      $nameError = "Name is required";
  } else {
      $name = clean($_POST["name"]);
  }
  
  $sort = intval(clean($_POST["sort"]));
  $price = intval(floatval(clean($_POST["price"])) * 100.0);
  $product_id = intval(clean($_POST["product"]));
  
  if($price == 0) { $priceError = "Price is required"; }
  if($product_id == 0) { $productError = "Invalid Product"; }

  if($nameError == "" && $priceError == "" && $productError == "") {
      $variantStore->insert([
          "name" => $name,
          "sort" => intval($sort),
          "product" => intval($product_id),
          "price" => intval($price),
          "disabled" => $disabled,
          ]);
          
      header("Location:shop-admin.php");
  }
}

?>

<?php $title = "Add Variant"; ?>
<?php include "shop-admin-head.php" ?>

<body>
  <main>
  <h1><?php echo $title; ?></h1>
  <span class="error"><?php echo $productError; ?></span>
  <form method="post" action="<?php echo htmlspecialchars($_SERVER["PHP_SELF"]);?>">
      <input type="hidden" id="product" name="product" value="<?php echo $product_id; ?>">
      <div><label for="name">Name</label><span class="error">* <?php echo $nameError;?></span></div>
      <input required type="text" id="name" name="name" value="<?php echo $name; ?>">
      <div><label for="price">Price</label><span class="error">* <?php echo $priceError;?></span></div>
      <div>$<input required type="number" min="1" id="price" name="price" value="<?php echo (floatval($price) / 100.0); ?>"></div>
      <label for="sort">Sort Order
      <input type="number" min="1" id="sort" name="sort" value="<?php echo $sort; ?>"></label>
      <hr>
      <div class="text-center"><input type="submit" name="submit" value="Add Variant"></div>
      <hr>
  </form>
  <div class="text-center"><a href="shop-admin.php">Cancel</a></div>
  </main>
</body>
</html>