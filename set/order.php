<?php
require '../auth.php';
require '../functions.php';

if (!isset($_POST['firstName'])) {
  sendError(400, 'First Name is required.');
  exit();
}

if (!isset($_POST['lastName'])) {
  sendError(400, 'Last Name is required.');
  exit();
}

if (!isset($_POST['phone'])) {
  sendError(400, 'Phone Number is required.');
  exit();
}

if (!isset($_POST['email'])) {
  sendError(400, 'Email is required.');
  exit();
}

if (!isset($_POST['street'])) {
  sendError(400, 'Street is required.');
  exit();
}

if (!isset($_POST['city'])) {
  sendError(400, 'City is required.');
  exit();
}

if (!isset($_POST['zip'])) {
  sendError(400, 'Zip is required.');
  exit();
}

if (!isset($_POST['order'])) {
  sendError(400, 'Please select items to order.');
  exit();
}

$firstName = $_POST['firstName'];
$lastName = $_POST['lastName'];
$phone = $_POST['phone'];
$email = $_POST['email'];
$street = $_POST['street'];
$city = $_POST['city'];
$zip = $_POST['zip'];
$orderArray = $_POST['order'];

$insertCustomer = $conx->prepare("INSERT INTO customers (
  first_name
 ,last_name
 ,email
 ,street
 ,city
 ,zip
 ,phone
 ,ordered) VALUES
 (?, ?, ?, ?, ?, ?, ?, NOW())");
if (!$insertCustomer->execute(array($firstName, $lastName, $email, $street, $city, $zip, $phone))) {
  sendError(500, 'Unexepected error, please try again.');
  exit;
}

$insertOrder = $conx->prepare("INSERT INTO orders (
  id_customer
  ,id_food
  ,amount
  ,price
  ,total
  )
  SELECT
  ?
  ,?
  ,?
  ,foods.cost
  ,foods.cost * ?
  FROM foods WHERE id_food = ?");

$id_customer = $conx->lastInsertId();
for ($x = 0; $x < count($orderArray); $x++) {
  $insertOrder->execute(array($id_customer, $orderArray[$x]['id_food'], $orderArray[$x]['amount'], $orderArray[$x]['amount'], $orderArray[$x]['id_food']));
}

$grandTotal = 0;
$orderList = '<table style="width: 100%;"><thead style="background:rgb(103,58,183);"><tr><th>Kind</th><th>Amount</th><th>Cost</th><th>Total</th></tr></thead><tbody>';

$getOrderInfo = $conx->prepare("SELECT foods.name
    ,orders.amount
    ,orders.price
    ,orders.total
  FROM foods
  INNER JOIN orders ON orders.id_food = foods.id_food
  WHERE orders.id_customer = ?
");
$getOrderInfo->execute(array($id_customer));
while ($item = $getOrderInfo->fetch()) {
  $grandTotal += $item['amount'] * $item['price'];
  $orderList .= '<tr><td>'.$item['name'].'</td><td style="text-align: right;>'.$item['amount'].'</td><td style="text-align: right;>'.$item['price'].'</td><td style="text-align: right;>$'.$item['total'].'</td></tr>';
}

$orderList .= '</tbody><tfoot><tr><td colspan="3" style="text-align: right;">Total:</td><td style="text-align: right;">$'.$grandTotal['Total'].'</td></tr></tfoot></table>';

$updateTotal = $conx->prepare("UPDATE customers
  SET customers.total = ?
  WHERE customers.id_customer = ?");
$updateTotal->execute(array($grandTotal, $id_customer));

$address = $street . $city . ', NY'. $zip;

$subject = 'New My Cookie Jar Order';
$message = '<!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8">
      <title>New My Cookie Jar Order from '.$firstName.' '.$lastName.'</title>
    </head>
    <body style="margin:0px; font-family:Tahoma, Geneva, sans-serif;">
      <div style="padding:10px; background:rgb(103,58,183); font-size:24px; color:#CCC;"><img id="logo" src="http://mycookiejarandmore.com/images/mycookiejar.png" alt="My Cookie Jar Logo" title="My Cookie Jar"></div>
      <div style="padding:24px; font-size:17px;">
        <p>Order Date: '.date('m/d/Y h:i:s a', time()).'</p>
        <p>Name: '.$firstName.' '.$lastName.'</p>
        <p>Phone: '.$phone.'</p>
        <p>Email: '.$email.'</p>
        <p>Address: <a href="http://maps.google.com/?q="'.$address.' target="_blank">'.$address.'</a></p>
        <div>
          <p>Order:</p>
          '.$orderList.'
        </div>
      </div>
    </body>
  </html>';
$headers = "From: $emailFrom\n";
$headers .= "MIME-Version: 1.0\n";
$headers .= "Content-type: text/html; charset=iso-8859-1\n";
// mail($emailTo, $subject, $message, $headers);

$to = $address;
$from = "do-not-reply@mycookiejarandmore.com";
$subject = 'My Cookie Jar Order Confirmation';
$message = '<!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8">
      <title>Your Cookie Jar Order</title>
    </head>
    <body style="margin:0px; font-family:Tahoma, Geneva, sans-serif;">
      <div style="padding: 10px; background:rgb(103,58,183);">
        <img id="logo" src="http://mycookiejarandmore.com/images/mycookiejar.png" alt="My Cookie Jar Logo" title="My Cookie Jar">
      </div>
      <div style="padding:24px; font-size:17px;">
        <p>Thank you for ordering from My Cookie Jar and More!  We have successfully received your order and will contact you shortly about a delivery place and time.</p>
        <p>Please refer to your order below and contact us within the next 24 hours if you would like to make any changes to your order.</p>
        <div>
          <p>Order:</p>
          '.$orderList.'
        </div>
        <p>E-mail us at: mary@mycookiejarandmore.com.</p>
      </div>
    </body>
  </html>';
$headers = "From: $from\n";
$headers .= "MIME-Version: 1.0\n";
$headers .= "Content-type: text/html; charset=iso-8859-1\n";
// mail($to, $subject, $message, $headers);

sendSuccess(200, 'Order submitted');
