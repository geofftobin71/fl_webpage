<?php include "shop-admin-pre.php" ?>
<?php

$id = 0;
$idError = "";

if(isset($_GET["id"])) { $id = intval(clean($_GET["id"])); }

if($id == 0) { $idError = "Invalid ID"; }

if($id && $idError == "") {
  $itemStore->deleteById($id);
      
  header("Location:shop-admin.php");
}

echo $idError;

?>