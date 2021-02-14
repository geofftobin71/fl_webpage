<?php include "shop-admin-pre.php" ?>
<?php

$id = 0;
$idError = "";

if($_SERVER["REQUEST_METHOD"] == "POST") {
  $id = intval(clean($_POST["id"]));
  if($id == 0) { $idError = "Invalid ID"; }

  if($idError == "") {
      $variantStore->deleteById($id);
          
      header("Location:shop-admin.php");
  }
}

if(isset($_GET["id"])) { 
    $id = intval(clean($_GET["id"]));
    if($id == 0) { $idError = "Invalid ID"; }
}

?>

<?php $title = "Delete Variant"; ?>
<?php include "shop-admin-head.php" ?>

<body>
  <main>
  <h1><?php echo $title; ?></h1>
  <span class="error"><?php echo $idError; ?></span>
  
  <table>
      <tr><th>id</th><th>Name</th><th>Sort</th><th>Product</th><th>Price</th><th>Disabled</th></tr>
        <?php $variant = $variantStore->findById($id); 
        $name = $variant['name'];
        $sort = $variant['sort'];
        $price = $variant['price'];
        $product_id = $variant['product'];
        $product_name = $productStore->findById($product_id)['name'];
        $disabled = filter_var($variant['disabled'], FILTER_VALIDATE_BOOLEAN);
        ?>
        <tr>
        <td><?php echo $id; ?></td>
        <td><?php echo $name; ?></td>
        <td><?php echo $sort; ?></td>
        <td><?php echo $product_name; ?></td>
        <td>$<?php echo formatMoney(floatVal($price) / 100.0); ?></td>
        <td class="ok text-center"><?php echo $disabled ? '&check;' : ''; ?></td>
        </tr>
  </table>  
  
  <form method="post" action="<?php echo htmlspecialchars($_SERVER["PHP_SELF"]);?>">
      <input type="hidden" id="id" name="id" value="<?php echo $id; ?>">
      <hr>
      <div class="text-center"><input type="submit" name="submit" value="Delete"></div>
      <hr>
  </form>
  <div class="text-center"><a href="shop-admin.php">Cancel</a></div>
  </main>
</body>
</html>