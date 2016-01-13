<?php require_once('check_login_status.php');
require_once('recaptchalib.php');
if (isset($_POST['name1']) && isset($_POST['name2']) && isset($_POST['number']) && isset($_POST['email']) && isset($_POST['address']) && isset($_POST['order']) && isset($_POST['captcha'])) {
  $secret = '6Ldb7xQTAAAAAMmRg2LQ8RYAO4Ck0i3V1aHsbRK8';
  $response = null;
  $reCaptcha = new ReCaptcha($secret);
  $captcha = $_POST['captcha'];
  $response = $reCaptcha->verifyResponse(
    $_SERVER["REMOTE_ADDR"],
    $captcha
  );
  if (!$response->success || $response == null) {
    echo 'captcha_fail';
  }
  $success = true;
  $name1 = $_POST['name1'];
  $name2 = $_POST['name2'];
  $number = $_POST['number'];
  $email = $_POST['email'];
  $address = $_POST['address'];
  $orderArray = $_POST['order'];
  $sql=$conx->prepare("INSERT INTO customers (First_Name, Last_Name, Email, Address, Number, Order_Date) VALUES(?, ?, ?, ?, ?, NOW())");
  $sql->bind_param('sssss', $name1, $name2, $email, $address, $number);
  if (!$sql->execute()) {
    $success = false;
  }
  $customer_id = $conx->insert_id;
  $total = 0;
  $orderList = '<table style="width: 100%;"><thead style="background:rgb(103,58,183);"><tr><th>Kind</th><th>Amount</th><th>Cost</th><th>Total</th></tr></thead><tbody>';
  for ($x = 0; $x < count($orderArray); $x++) {
    if ($orderArray[$x][3] != 0) {
      $total = $orderArray[$x][3] * $orderArray[$x][2];
      $sql=$conx->prepare("INSERT INTO orders (Customer_ID, Food_ID, Amount, Price, Total) VALUES(?, ?, ?, (SELECT Cost FROM foods WHERE Food_ID = ?), (SELECT Cost FROM foods WHERE Food_ID = ?) * ?)");
      $sql->bind_param('iiiiii', $customer_id, $orderArray[$x][0], $orderArray[$x][3], $orderArray[$x][0], $orderArray[$x][0], $orderArray[$x][3]);
      if (!$sql->execute()) {
        $success = false;
      }
      $orderList .= '<tr><td>'.$orderArray[$x][1].'</td><td style="text-align: right;>'.$orderArray[$x][3].'</td><td style="text-align: right;>'.$orderArray[$x][2].'</td><td style="text-align: right;>$'.$total.'</td></tr>';
    }
  }
  $sql = "UPDATE customers SET Total = (SELECT sum(Total) From orders WHERE Customer_ID = $customer_id) WHERE Customer_ID = $customer_id";
  $query = mysqli_query($conx, $sql);
  $sql = "SELECT Total FROM customers WHERE Customer_ID = $customer_id";
  $query = mysqli_query($conx, $sql);
  $grandTotal = mysqli_fetch_assoc($query);
  $orderList .= '</tbody><tfoot><tr><td colspan="3" style="text-align: right;">Total:</td><td style="text-align: right;>$'.$grandTotal['Total'].'</td></tr></tfoot></table>';
  if ($success) {
    $to = "jrs40492@gmail.com";
		$from = "admin@mycookiejarandmore.com";
		$subject = 'New My Cookie Jar Order';
		$message = '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>New My Cookie Jar Order from '.$name1.' '.$name2.'</title></head><body style="margin:0px; font-family:Tahoma, Geneva, sans-serif;"><div style="padding:10px; background:rgb(103,58,183); font-size:24px; color:#CCC;">New Cookie Order</div><div style="padding:24px; font-size:17px;">Order Date: '.date('m/d/Y h:i:s a', time()).'<br />Name: '.$name1.' '.$name2.'<br />Number: '.$number.'<br />Email: '.$email.'<br />Address: <a href="http://maps.google.com/?q="'.$address.' target="_blank">'.$address.'</a><br>Order:<br />'.$orderList.'</div></body></html>';
		$headers = "From: $from\n";
		$headers .= "MIME-Version: 1.0\n";
		$headers .= "Content-type: text/html; charset=iso-8859-1\n";
		mail($to, $subject, $message, $headers);

    $to = $address;
		$from = "do-not-reply@mycookiejarandmore.com";
		$subject = 'My Cookie Jar Order Confirmation';
		$message = '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>New Cookie Order</title></head><body style="margin:0px; font-family:Tahoma, Geneva, sans-serif;"><div style="padding:10px; background:rgb(103,58,183); font-size:24px; color:#CCC;">New Cookie Order</div><div style="padding:24px; font-size:17px;"><p>
    Thank you for ordering from My Cookie Jar!  We have successfully recieved your order and will contacting you shortly about a delivery time.</p>Order:<br />'.$orderList.'</div></body></html>';
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
