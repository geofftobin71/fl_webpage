<?php include "shop-admin-pre.php" ?>
<?php

$category_id = 0;
$nameError = $categoryError = "";

if(isset($_GET["category"])) { 
    $category_id = intval(clean($_GET["category"])); 
    if($category_id == 0) { $categoryError = "Invalid Category"; }
}

$name = $description = "";
// $sort = (count($productStore->findBy(["category", "=", $category_id])) + 1) * 10;
$sort = 0;
foreach($productStore->findBy(["category", "=", $category_id]) as $category) {
    $new_sort = intval($category["sort"]);
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
  $description = clean($_POST["description"]);
  $sort = intval(clean($_POST["sort"]));
  $category_id = intval(clean($_POST["category"]));
  
  if($category_id == 0) { $categoryError = "Invalid Category"; }

  if($nameError == "" && $categoryError == "") {
      $productStore->insert([
          "name" => $name,
          "description" => $description,
          "sort" => intval($sort),
          "category" => intval($category_id),
          "disabled" => $disabled,
          ]);
          
      header("Location:shop-admin.php");
  }
}

?>

<?php $title = "Add Product"; ?>
<?php include "shop-admin-head.php" ?>

<body>
  <main>
  <h1><?php echo $title; ?></h1>
  <span class="error"><?php echo $categoryError; ?></span>
  <form method="post" action="<?php echo htmlspecialchars($_SERVER["PHP_SELF"]);?>">
      <input type="hidden" id="category" name="category" value="<?php echo $category_id; ?>">
      <div><label for="name">Name</label><span class="error">* <?php echo $nameError;?></span></div>
      <input required type="text" id="name" name="name" value="<?php echo $name; ?>">
      <label for="description">Description</label>
      <textarea id="description" name="description" rows="8"><?php echo $description; ?></textarea>
      <label for="sort">Sort Order
      <input type="number" min="1" id="sort" name="sort" value="<?php echo $sort; ?>"></label>
      <hr>
      <div class="text-center"><input type="submit" name="submit" value="Add Product"></div>
      <hr>
  </form>
  <div class="text-center"><a href="shop-admin.php">Cancel</a></div>
  </main>
</body>
</html>