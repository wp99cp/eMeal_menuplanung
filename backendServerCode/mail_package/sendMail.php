<?php

// PHP Mailer files
require("libs/PHPMailer.php");
require("libs/SMTP.php");

// function for sending E-Mails via PHP
function sendMail($body, $header, $adress)
{

  // file containing two variables $username and $password
  require("userAuth.php");

  $mail = new PHPMailer\PHPMailer\PHPMailer();
  $mail->IsSMTP(); // enable SMTP

  $mail->SMTPDebug = 2; // debugging: 1 = errors and messages, 2 = messages only

  $mail->CharSet = 'UTF-8';

  $mail->SMTPAuth = true; // authentication enabled
  $mail->SMTPSecure = 'tls'; // secure transfer enabled REQUIRED for Gmail
  $mail->Host = "smtp.gmail.com";
  $mail->Port = 587; // or 587

  // username and password form the userAuth.php
  $mail->Username = $username;
  $mail->Password = $password;

  // HTML body
  $mail->IsHTML(true);


  $mail->SetFrom("noreply@zh11.ch", "Cevi Züri 11");
  $mail->Subject = $header;
  $mail->Body = $body;
  $mail->AddAddress($adress);

  if (!$mail->Send()) {

    echo "Mailer Error: " . $mail->ErrorInfo;
  } else {

    echo "Message has been sent";
  }
}
