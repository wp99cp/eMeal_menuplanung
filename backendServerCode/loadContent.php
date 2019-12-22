<?php


// inculde swissmilk parser
include("./swissmilk.php");

// ladet die URL des Rezeptes aus dem URL-Parameter '?url='
$url = htmlspecialchars($_GET["url"]);

// Rückgabewert ist ein JSON; allow loaclhost
header('Content-Type: application/json');

// prüft die URL (ob sie unterstütze wird)
if (strpos($url, 'swissmilk.ch') !== false) {

  // ladet das Rezept mit dem Swissmilk-Parser
  echo loadFromSwissmilk(createDom($url), $url);
} else {

  // exit with error
  $error = null;
  $error->error = "unsupported url";
  echo json_encode($error);
}


function createDom($url)
{

  // ladet das HTML File von der URL
  $str = file_get_contents($url);

  // invalid url
  if ($str == "") {
    $error = null;
    $error->error = "invalid url";
    echo json_encode($error);
  }

  $dom = new DOMDocument();
  $dom->loadHTML($str);

  return $dom;
}
