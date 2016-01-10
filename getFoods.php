<?php require_once('check_login_status.php');
$getFoodSql = 'SELECT * FROM foods';
$getFoodQuery = mysqli_query($conx, $getFoodSql);
while ($food = mysqli_fetch_assoc($getFoodQuery)) {
  $data[] = $food;
}
echo json_encode($data);
$conx->close();
