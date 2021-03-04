<?php include "shop-admin-pre.php" ?>
<?php

$variant_id = 0;
$variantError = "";

if(isset($_GET["variant"])) { 
    $variant_id = intval(clean($_GET["variant"])); 
    if($variant_id == 0) { $variantError = "Invalid Variant"; }
}

$updated = new DateTime;

if($variantError == "") {
  $itemStore->insert([
      "variant" => intval($variant_id),
      "updated" => $updated,
      "cart" => null,
      "sold" => false,
  ]);
          
  header("Location:shop-admin.php");
}

echo $variantError;

?>
