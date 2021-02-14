<?php include "shop-admin-pre.php" ?>
<?php

$name = $description = $variant_type = "";
// $sort = (count($categoryStore->findAll()) + 1) * 10;
$sort = 0;
foreach($categoryStore->findAll() as $category) {
    $new_sort = intval($category["sort"]);
    $sort = $new_sort > $sort ? $new_sort : $sort;
}
$sort += 10;
$parent_id = 0;
$finite = $disabled = false;
$delivery = true;

$nameError = "";

if($_SERVER["REQUEST_METHOD"] == "POST") {
  if(empty($_POST["name"])) {
      $nameError = "Name is required";
  } else {
      $name = clean($_POST["name"]);
  }
  $description = clean($_POST["description"]);
  $sort = intval(clean($_POST["sort"]));
  $parent_id = intval(clean($_POST["parent"]));
  $variant_type = clean($_POST["variant"]);
  $finite = filter_var(clean($_POST["finite"]), FILTER_VALIDATE_BOOLEAN);
  $delivery = filter_var(clean($_POST["delivery"]), FILTER_VALIDATE_BOOLEAN);
  
  if($nameError == "") {
      $categoryStore->insert([
          "name" => $name,
          "description" => $description,
          "sort" => intval($sort),
          "parent" => intval($parent_id),
          "variant" => $variant_type,
          "finite" => $finite,
          "delivery" => $delivery,
          "disabled" => $disabled,
          ]);
          
      header("Location:shop-admin.php");
  }
}

?>

<?php $title = "Add Category"; ?>
<?php include "shop-admin-head.php" ?>

<body>
  <main>
  <h1><?php echo $title; ?></h1>
  <form method="post" action="<?php echo htmlspecialchars($_SERVER["PHP_SELF"]);?>">
      <div><label for="name">Name</label><span class="error">* <?php echo $nameError;?></span></div>
      <input required type="text" id="name" name="name" value="<?php echo $name; ?>">
      <label for="description">Description</label>
      <textarea id="description" name="description" rows="8"><?php echo $description; ?></textarea>
      <label for="sort">Sort Order
      <input type="number" min="1" id="sort" name="sort" value="<?php echo $sort; ?>"></label>
      <label for="parent">Parent
      <select id="parent" name="parent">
          <option value="0">None</option>
          <?php foreach($categoryStore->findBy(["disabled", "!=", true],["sort" => "asc"]) as $category) { 
          $cat_id = $category['_id'];
          $cat_name = $category['name'];
          ?>
          <option value="<?php echo $cat_id ?>"><?php echo $cat_name; ?></option>
          <?php } ?>
      </select></label>
      <label for="variant">Variant Type</label>
      <input type="text" id="variant" name="variant" value="<?php echo $variant_type; ?>">
      <label for="finite">Finite
      <input type="checkbox" id="finite" name="finite" <?php if($finite) { echo 'checked'; } ?>></label>
      <label for="delivery">Delivery
      <input type="checkbox" id="delivery" name="delivery" <?php if($delivery) { echo 'checked'; } ?>></label>
      <hr>
      <div class="text-center"><input type="submit" name="submit" value="Add Category"></div>
      <hr>
  </form>
  <div class="text-center"><a href="shop-admin.php">Cancel</a></div>
  </main>
</body>
</html>