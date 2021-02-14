<?php include "shop-admin-pre.php" ?>
<?php

$id = $sort = $parent_id = 0;
$name = $description = $variant_type = "";
$delivery = $finite = $disabled = false;

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
  $parent_id = intval(clean($_POST["parent"]));
  $variant_type = clean($_POST["variant"]);
  $finite = filter_var(clean($_POST["finite"]), FILTER_VALIDATE_BOOLEAN);
  $delivery = filter_var(clean($_POST["delivery"]), FILTER_VALIDATE_BOOLEAN);
  $disabled = filter_var(clean($_POST["disabled"]), FILTER_VALIDATE_BOOLEAN);
  
  if($idError == "" && $nameError == "") {
      $category = $categoryStore->findById($id);
      
      $category['name'] = $name;
      $category['description'] = $description;
      $category['sort'] = intval($sort);
      $category['parent'] = intval($parent_id);
      $category['variant'] = $variant_type;
      $category['finite'] = $finite;
      $category['delivery'] = $delivery;
      $category['disabled'] = $disabled;
      
      $categoryStore->update($category);
          
      header("Location:shop-admin.php");
  }
}

if(isset($_GET["id"])) { 
    $id = intval(clean($_GET["id"]));
    if($id == 0) { $idError = "Invalid ID"; }
}

$category = $categoryStore->findById($id);
$name = $category['name'];
$description = $category['description'];
$sort = intval($category['sort']);
$parent_id = intval($category['parent']);
$parent_name = $parent_id ? $categoryStore->findById($parent_id)['name'] : '';
$variant_type = $category['variant'];
$finite = filter_var($category['finite'], FILTER_VALIDATE_BOOLEAN);
$delivery = filter_var($category['delivery'], FILTER_VALIDATE_BOOLEAN);
$disabled = filter_var($category['disabled'], FILTER_VALIDATE_BOOLEAN);

?>

<?php $title = "Update Category"; ?>
<?php include "shop-admin-head.php" ?>

<body>
  <main>
  <h1><?php echo $title; ?></h1>
  <span class="error"><?php echo $idError; ?></span>
  <form method="post" action="<?php echo htmlspecialchars($_SERVER["PHP_SELF"]);?>">
      <input type="hidden" id="id" name="id" value="<?php echo $id; ?>">
      <div><label for="name">Name</label><span class="error">* <?php echo $nameError; ?></span></div>
      <input required type="text" id="name" name="name" value="<?php echo $name; ?>">
      <label for="description">Description</label>
      <textarea id="description" name="description" rows="8"><?php echo $description; ?></textarea>
      <label for="sort">Sort Order
      <input type="number" min="1" id="sort" name="sort" value="<?php echo $sort; ?>"></label>
      <label for="parent">Parent
      <select id="parent" name="parent">
          <option value="0" <?php echo $parent_id == 0 ? 'selected' : ''; ?> >None</option>
          <?php foreach($categoryStore->findBy(["disabled", "!=", true],["sort" => "asc"]) as $category) { 
          $cat_id = $category['_id'];
          $cat_name = $category['name'];
          if($cat_id === $id) { continue; }
          ?>
          <option value="<?php echo $cat_id ?>" <?php echo $cat_id == $parent_id ? 'selected' : ''; ?> ><?php echo $cat_name; ?></option>
          <?php } ?>
      </select></label>
      <label for="variant">Variant Type</label>
      <input type="text" id="variant" name="variant" value="<?php echo $variant_type; ?>">
      <label for="finite">Finite
      <input type="checkbox" id="finite" name="finite" <?php if($finite) { echo 'checked'; } ?>></label>
      <label for="delivery">Delivery
      <input type="checkbox" id="delivery" name="delivery" <?php if($delivery) { echo 'checked'; } ?>></label>
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