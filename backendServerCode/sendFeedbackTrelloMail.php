<?php
print phpinfo();

$to_email = 'jpg@zh11.ch';
$subject = 'Testing PHP Mail';
$message = 'This mail is sent using the PHP mail function';
$headers = 'From: noreply@zh11.ch';
mail($to_email, $subject, $message, $headers);
