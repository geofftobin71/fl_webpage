<?php include "shop-admin-pre.php" ?>
<?php

$id = 0;
$idError = "";

if($_SERVER["REQUEST_METHOD"] == "POST") {
  $id = intval(clean($_POST["id"]));
  if($id == 0) { $idError = "Invalid ID"; }

  if($idError == "") {
      $productStore->deleteById($id);
          
      header("Location:shop-admin.php");
  }
}

if(isset($_GET["id"])) { 
    $id = intval(clean($_GET["id"]));
    if($id == 0) { $idError = "Invalid ID"; }
}

?>

<?php $title = "Delete Product"; ?>
<?php include "shop-admin-head.php" ?>

<body>
  <main>
  <h1><?php echo $title; ?></h1>
  <span class="error"><?php echo $idError; ?></span>
  
  <table>
      <tr><th>id</th><th>Name</th><th>Description</th><th>Sort</th><th>Category</th><th>Disabled</th></tr>
        <?php $product = $productStore->findById($id); 
        $name = $product['name'];
        $description = $product['description'];
        $sort = $product['sort'];
        $category_id = $product['category'];
        $category_name = $categoryStore->findById($category_id)['name'];
        $disabled = filter_var($product['disabled'], FILTER_VALIDATE_BOOLEAN);
        ?>
        <tr>
        <td><?php echo $id; ?></td>
        <td><?php echo $name; ?></td>
        <td class="longtext"><?php echo $description; ?></td>
        <td><?php echo $sort; ?></td>
        <td><?php echo $category_name; ?></td>
        <td class="text-center"><?php echo $disabled ? '&check;' : ''; ?></td>
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