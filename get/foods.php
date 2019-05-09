<?php require '../auth.php';
require '../functions.php';

$getFood = $conx->prepare(
  "SELECT foods.*
    ,types.type
  FROM foods
  INNER JOIN types
  ON types.id_type = foods.id_type
  WHERE foods.is_active = 1
    AND types.is_active = 1
  ORDER BY foods.name");
if (!$getFood->execute()) {
  sendError(500, 'Unexpected error, please try again.');
}

$data = [];
while ($food = $getFood->fetch()) {
  $data[] = $food;
}
sendSuccess(200, json_encode($data, JSON_NUMERIC_CHECK));