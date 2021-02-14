<?php include "shop-admin-pre.php" ?>
<?php

$id = $sort = $category_id = 0;
$name = $description = "";
$disabled = false;

$nameError = $idError = "";

if($_SERVER["REQUEST_METHOD"] == "POST") {
  $id = intval(clean($_POST["id"]));
  if($id == 0) { $idError = "Invalid ID"; }

  if(empty($_POST["name"])) {
      $nameError = "Name is required";
  } else {
      $name = clean($_POST["name"]);
  }
  $description = clean($_POST["description"]);
  $sort = intval(clean($_POST["sort"]));
  $category_id = intval(clean($_POST["category"]));
  $disabled = filter_var(clean($_POST["disabled"]), FILTER_VALIDATE_BOOLEAN);
  
  if($idError == "" && $nameError == "") {
      $product = $productStore->findById($id);
      
      $product['name'] = $name;
      $product['description'] = $description;
      $product['sort'] = intval($sort);
      $product['category'] = intval($category_id);
      $product['disabled'] = $disabled;
      
      $productStore->update($product);
          
      header("Location:shop-admin.php");
  }
}

if(isset($_GET["id"])) { 
    $id = intval(clean($_GET["id"]));
    if($id == 0) { $idError = "Invalid ID"; }
}

$product = $productStore->findById($id);
$name = $product['name'];
$description = $product['description'];
$sort = intval($product['sort']);
$category_id = intval($product['category']);
$disabled = filter_var($product['disabled'], FILTER_VALIDATE_BOOLEAN);

?>

<?php $title = "Update Product"; ?>
<?php include "shop-admin-head.php" ?>

<body>
  <main>
  <h1><?php echo $title; ?></h1>
  <span class="error"><?php echo $idError; ?></span>
  <form method="post" action="<?php echo htmlspecialchars($_SERVER["PHP_SELF"]);?>">
      <input type="hidden" id="id" name="id" value="<?php echo $id; ?>">
      <input type="hidden" id="category" name="category" value="<?php echo $category_id; ?>">
      <div><label for="name">Name</label><span class="error">* <?php echo $nameError; ?></span></div>
      <input required type="text" id="name" name="name" value="<?php echo $name; ?>">
      <label for="description">Description</label>
      <textarea id="description" name="description" rows="8"><?php echo $description; ?></textarea>
      <label for="sort">Sort Order
      <input type="number" min="1" id="sort" name="sort" value="<?php echo $sort; ?>"></label>
      <label for="disabled">Disabled
      <input type="checkbox" id="disabled" name="disabled" <?php if($disabled) { echo 'checked'; } ?>></label>
      <hr>
      <div class="text-center"><input type="submit" name="submit" value="Update"></div>
      <hr>
  </form>
  <div class="text-center"><a href="shop-admin.php">Cancel</a></div>
  </main>
</body>
</html>