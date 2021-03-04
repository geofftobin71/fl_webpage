<?php include "shop-admin-pre.php" ?>
<?php

$id = $sort = $product_id = $price = 0;
$name = "";
$disabled = false;

$nameError = $priceError = $idError = "";

if($_SERVER["REQUEST_METHOD"] == "POST") {
  $id = intval(clean($_POST["id"]));
  if($id == 0) { $idError = "Invalid ID"; }

  if(empty($_POST["name"])) {
      $nameError = "Name is required";
  } else {
      $name = clean($_POST["name"]);
  }
  $sort = intval(clean($_POST["sort"]));
  $price = intval(floatval(clean($_POST["price"])) * 100.0);
  $product_id = intval(clean($_POST["product"]));
  
  if($price == 0) { $priceError = "Price is required"; }
  if($product_id == 0) { $idError = "Invalid Product"; }
  $disabled = filter_var(clean($_POST["disabled"]), FILTER_VALIDATE_BOOLEAN);
  
  if($idError == "" && $nameError == "" && $priceError == "") {
      $variant = $variantStore->findById($id);
      
      $variant['name'] = $name;
      $variant['sort'] = intval($sort);
      $variant['product'] = intval($product_id);
      $variant['price'] = intval($price);
      $variant['disabled'] = $disabled;
      
      $variantStore->update($variant);
          
      header("Location:shop-admin.php");
  }
}

if(isset($_GET["id"])) { 
    $id = intval(clean($_GET["id"]));
    if($id == 0) { $idError = "Invalid ID"; }
}

$variant = $variantStore->findById($id);
$name = $variant['name'];
$sort = $variant['sort'];
$price = $variant['price'];
$product_id = $variant['product'];
$disabled = filter_var($variant['disabled'], FILTER_VALIDATE_BOOLEAN);

?>

<?php $title = "Update Variant"; ?>
<?php include "shop-admin-head.php" ?>

<body>
  <main>
  <h1><?php echo $title; ?></h1>
  <span class="error"><?php echo $idError; ?></span>
  <form method="post" action="<?php echo htmlspecialchars($_SERVER["PHP_SELF"]);?>">
      <input type="hidden" id="id" name="id" value="<?php echo $id; ?>">
      <input type="hidden" id="product" name="product" value="<?php echo $product_id; ?>">
      <div><label for="name">Name</label><span class="error">* <?php echo $nameError;?></span></div>
      <input required type="text" id="name" name="name" value="<?php echo $name; ?>">
      <div><label for="price">Price</label><span class="error">* <?php echo $priceError;?></span></div>
      <div>$<input required type="number" min="1" id="price" name="price" value="<?php echo (floatval($price) / 100.0); ?>"></div>
      <label for="sort">Sort Order
      <input type="number" min="1" id="sort" name="sort" value="<?php echo $sort; ?>"></label>
      <hr>
      <div class="text-center"><input type="submit" name="submit" value="Update"></div>
      <hr>
  </form>
  <div class="text-center"><a href="shop-admin.php">Cancel</a></div>
  </main>
</body>
</html>