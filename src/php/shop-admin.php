<?php include "shop-admin-pre.php" ?>

<?php $title = "Shop Admin"; ?>
<?php include "shop-admin-head.php" ?>

<body>
  <main>
  <h1>Floriade Shop Admin</h1>
  
  <div style="display:flex;align-items:center"><h2>Categories</h2>&nbsp;&nbsp;&nbsp;&nbsp;<a href="add-category.php">Add Category</a></div>
  <table>
      <tr><th>id</th><th>Name</th><th>Description</th><th>Sort</th><th>Parent</th><th>Variant Type</th><th>Finite</th><th>Delivery</th><th>Disabled</th></tr>
      <?php foreach($categoryStore->findBy(["_id", ">", 0],["sort" => "asc"]) as $category) { 
      $id = $category['_id'];
      $name = $category['name'];
      $description = $category['description'];
      $sort = $category['sort'];
      $parent_id = $category['parent'];
      $parent_name = $parent_id ? $categoryStore->findById($parent_id)['name'] : '';
      $variant_type = $category['variant'];
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
    <td><?php echo $variant_type; ?></td>
    <td class="ok text-center"><?php echo $finite ? '&check;' : ''; ?></td>
    <td class="ok text-center"><?php echo $delivery ? '&check;' : ''; ?></td>
    <td class="ok text-center"><?php echo $disabled ? '&check;' : ''; ?></td>
    <td><a href="<?php echo 'update-category.php?id=' . $id ?>">Edit</a></td>
    <td><a href="<?php echo 'add-product.php?category=' . $id ?>">Add Product</a></td>
    <td><a href="<?php echo 'delete-category.php?id=' . $id ?>">Delete</a></td>
    </tr>
  <?php } ?>
  </table>
  
  <h2>Products</h2>
  <table>
      <tr><th>id</th><th>Name</th><th>Description</th><th>Sort</th><th>Category</th><th>Disabled</th></tr>
      <?php foreach($categoryStore->findBy(["_id", ">", 0],["sort" => "asc"]) as $category) { 
      $cat_id = $category['_id'];
      $cat_name = $category['name'];
      ?>
        <?php foreach($productStore->findBy(["category", "=", $cat_id],["sort" => "asc"]) as $product) { 
        $id = $product['_id'];
        $name = $product['name'];
        $description = $product['description'];
        $sort = $product['sort'];
        $disabled = filter_var($product['disabled'], FILTER_VALIDATE_BOOLEAN);
        ?>
        <tr>
        <td><?php echo $id; ?></td>
        <td><?php echo $name; ?></td>
        <td class="longtext"><?php echo $description; ?></td>
        <td><?php echo $sort; ?></td>
        <td><?php echo $cat_name; ?></td>
        <td class="ok text-center"><?php echo $disabled ? '&check;' : ''; ?></td>
        <td><a href="<?php echo 'update-product.php?id=' . $id ?>">Edit</a></td>
        <td><a href="<?php echo 'add-variant.php?product=' . $id ?>">Add Variant</a></td>
        <td><a href="<?php echo 'delete-product.php?id=' . $id ?>">Delete</a></td>
        </tr>
        <?php } ?>
      
      <?php } ?>
  </table>
  
  <h2>Variants</h2>
  <table>
      <tr><th>id</th><th>Name</th><th>Sort</th><th>Product</th><th>Price</th><th>Disabled</th></tr>
      <?php foreach($productStore->findBy(["_id", ">", 0],["sort" => "asc"]) as $product) { 
      $product_id = $product['_id'];
      $product_name = $product['name'];
      ?>
        <?php foreach($variantStore->findBy(["product", "=", $product_id],["sort" => "asc"]) as $variant) { 
        $id = $variant['_id'];
        $name = $variant['name'];
        $sort = $variant['sort'];
        $price = $variant['price'];
        $disabled = filter_var($variant['disabled'], FILTER_VALIDATE_BOOLEAN);
        ?>
        <tr>
        <td><?php echo $id; ?></td>
        <td><?php echo $name; ?></td>
        <td><?php echo $sort; ?></td>
        <td><?php echo $product_name; ?></td>
        <td>$<?php echo formatMoney(floatVal($price) / 100.0); ?></td>
        <td class="ok text-center"><?php echo $disabled ? '&check;' : ''; ?></td>
        <td><a href="<?php echo 'update-variant.php?id=' . $id ?>">Edit</a></td>
        <td><a href="<?php echo 'add-stock.php?variant=' . $id ?>">Add Stock</a></td>
        <td><a href="<?php echo 'delete-variant.php?id=' . $id ?>">Delete</a></td>
        </tr>
        <?php } ?>
      
      <?php } ?>
  </table>
  
  <h2>Stock</h2>
  <table>
      <tr><th>id</th><th>Variant</th><th>Updated</th><th>Cart Id</th><th>Sold</th></tr>
      <?php foreach($variantStore->findBy(["_id", ">", 0],["sort" => "asc"]) as $variant) { 
      $variant_id = $variant['_id'];
      $variant_name = $variant['name'];
      ?>
        <?php foreach($itemStore->findBy(["variant", "=", $variant_id],["updated" => "asc"]) as $item) { 
        $id = $item['_id'];
        $updated = new DateTime($item['updated']['date'], new DateTimeZone($item['updated']['timezone']));
        $cart_id = $item['cart'];
        $sold = $item['sold'];
        $ten_minutes_ago = new DateTime;
        $ten_minutes_ago->modify('-10 minutes');
        $in_cart = $updated >= $ten_minutes_ago;
        ?>
        <tr>
        <td><?php echo $id; ?></td>
        <td><?php echo $variant_id; ?></td>
        <td><?php echo $updated->format('H:i d M Y'); ?></td>
        <td><?php echo $cart_id; ?></td>
        <!-- <td class="ok text-center"><?php echo $in_cart ? '&check;' : ''; ?></td> -->
        <td class="ok text-center"><?php echo $sold ? '&check;' : ''; ?></td>
        <td><a href="<?php echo 'delete-stock.php?id=' . $id ?>">Delete</a></td>
        </tr>
        <?php } ?>
      
      <?php } ?>
  </table>  
  </main>
</body>
</html>