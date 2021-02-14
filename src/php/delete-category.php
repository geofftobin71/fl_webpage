<?php include "shop-admin-pre.php" ?>
<?php

$id = 0;
$idError = "";

if($_SERVER["REQUEST_METHOD"] == "POST") {
  $id = intval(clean($_POST["id"]));
  if($id == 0) { $idError = "Invalid ID"; }
  
  if($idError == "") {
      $categoryStore->deleteById($id);
          
      header("Location:shop-admin.php");
  }
}

if(isset($_GET["id"])) { 
    $id = intval(clean($_GET["id"]));
    if($id == 0) { $idError = "Invalid ID"; }
}

?>

<?php $title = "Delete Category"; ?>
<?php include "shop-admin-head.php" ?>

<body>
  <main>
  <h1><?php echo $title; ?></h1>
  <span class="error"><?php echo $idError; ?></span>
  
  <table>
      <tr><th>id</th><th>Name</th><th>Description</th><th>Sort</th><th>Parent</th><th>Finite</th><th>Delivery</th><th>Disabled</th></tr>
      <?php $category = $categoryStore->findById($id); 
      $name = $category['name'];
      $description = $category['description'];
      $sort = $category['sort'];
      $parent_id = $category['parent'];
      $parent_name = $parent_id ? $categoryStore->findById($parent_id)['name'] : '';
      $finite = filter_var($category['finite'], FILTER_VALIDATE_BOOLEAN);
      $delivery = filter_var($category['delivery'], FILTER_VALIDATE_BOOLEAN);
      $disabled = filter_var($category['disabled'], FILTER_VALIDATE_BOOLEAN);
      ?>
    <tr>
    <td><?php echo $id; ?></td>
    <td><?php echo $name; ?></td>
    <td class="longtext"><?php echo $description; ?></td>
    <td><?php echo $sort; ?></td>
    <td><?php echo $parent_name; ?></td>
    <td class="text-center"><?php echo $finite ? '&check;' : ''; ?></td>
    <td class="text-center"><?php echo $delivery ? '&check;' : ''; ?></td>
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