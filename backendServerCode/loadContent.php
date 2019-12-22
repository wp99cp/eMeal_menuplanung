<?php

// inculde swissmilk parser
include("./swissmilk.php");

// ladet die URL des Rezeptes aus dem URL-Parameter '?url='
$url = htmlspecialchars($_GET["url"]);

// Rückgabewert ist ein JSON
header('Content-Type: application/json');

// prüft die URL (ob sie unterstütze wird)
if (strpos($url, 'swissmilk.ch') !== false) {

    // ladet das Rezept mit dem Swissmilk-Parser
    echo loadFromSwissmilk(createDom($url), $url);
} else {

    // exit with error
    exit("unsupported url");
}


function createDom($url)
{

    // ladet das HTML File von der URL
    $str = file_get_contents($url);

    // invalid url
    if ($str == "") exit("invalid url");

    $dom = new DOMDocument();
    $dom->loadHTML($str);

    return $dom;
}
