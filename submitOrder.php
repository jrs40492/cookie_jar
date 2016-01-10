<?php require_once('check_login_status.php');
if (isset($_POST['name1']) && isset($_POST['name2']) && isset($_POST['number']) && isset($_POST['email']) && isset($_POST['address']) && isset($_POST['order'])) {
  $success = true;
  $name1 = $_POST['name1'];
  $name2 = $_POST['name2'];
  $number = $_POST['number'];
  $email = $_POST['email'];
  $address = $_POST['address'];
  $orderArray = $_POST['order'];
  $sql=$conx->prepare("INSERT INTO customers (First_Name, Last_Name, Email, Address, Number) VALUES(?, ?, ?, ?, ?)");
  $sql->bind_param('sssss', $name1, $name2, $email, $address, $number);
  if (!$sql->execute()) {
    $success = false;
  }
  $customer_id = $conx->insert_id;
  $total = 0;
  $grandTotal = 0;
  $orderList = "<table><thead><tr><th>Kind</th><th>Amount @ Cost</th><th>Total</th></tr></thead><tbody>";
  for ($x = 0; $x <= count($orderArray); $x++) {
    if ($orderArray[$x][3] != 0) {
      $total = $orderArray[$x][3] * $orderArray[$x][2];
      $grandTotal += $total;
      $sql=$conx->prepare("INSERT INTO orders (Customer_ID, Food_ID, Amount, Price, Total) VALUES(?, ?, ?, ?, ?)");
      $sql->bind_param('iiidd', $customer_id, $orderArray[$x][0], $orderArray[$x][3], $orderArray[$x][2], $total);
      if (!$sql->execute()) {
        $success = false;
      }
      $orderList += "<tr><td>".$orderArray[$x][1]."</td><td>".$orderArray[$x][3]." @ ".$orderArray[$x][2]."</td><td>
      ".."
      </td></tr>"
    }
  }
  $orderList += '</tbody><tfoot><tr><td colspan="2">Total:</td><td>'.$grandTotal.'</td></tr></tfoot></table>';
  $sql = "UPDATE customers SET Total = $grandTotal WHERE Customer_ID = $customer_id";
  $query = mysqli_query($conx, $sql);
  if ($success) {
    $to = "jrs40492@gmail.com";
		$from = "admin@mycookiejarandmore.com";
		$subject = 'New Cookie Order';
		$message = '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>New Cookie Order</title></head><body style="margin:0px; font-family:Tahoma, Geneva, sans-serif;"><div style="padding:10px; background:#333; font-size:24px; color:#CCC;">New Cookie Order</div><div style="padding:24px; font-size:17px;">Name: '.$name1.' '.$name2.'<br />Number: '.$number.'<br />Email: '.$email.'<br />Address: '.$address.'<br>Order:<br />'.$orderList.'</div></body></html>';
		$headers = "From: $from\n";
		$headers .= "MIME-Version: 1.0\n";
		$headers .= "Content-type: text/html; charset=iso-8859-1\n";
		mail($to, $subject, $message, $headers);
    echo 'Success';
  } else {
    echo 'Fail';
  }
} else {
  echo 'Fail';
  exit();
}
