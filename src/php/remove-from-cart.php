<?php
session_start();
if(isset($_GET["i"])) {
  $i = intVal($_GET["i"]);
  if($i < count($_SESSION["cart"])) {
    array_splice($_SESSION["cart"], $i, 1);
  }
}
header("Location:/cart/");
exit;
?>
