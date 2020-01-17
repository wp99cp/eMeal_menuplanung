<?php

// used for sending Mails via php and the gsuite api
require("mail_package/sendMail.php");
// containing the private trello mail adress
require("trelloSettings.php");

$feedback =  $_POST['feedback'];
$title = $_POST['title'];

sendMail($feedback, $title, $trello_adress);
