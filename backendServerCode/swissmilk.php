<?php

/**
 * Swissmilk Parser
 * 
 * Parst den HTML-Code von Swissmilk und gibt ein JSON mit den Daten aus.
 * Der Parser basiert auf der Webseite von Swissmilk Stand Dezember 2019.
 * 
 */
function loadFromSwissmilk($dom, $url)
{

    // Der finder wird für die Suche nach Klassen-Namen und anderen Atributten verwenden.
    $finder = new DomXPath($dom);

    // Suche nach dem Bereich mit den Zutaten: Suche im root, daher '//*' als Präfix
    $zutaten = $finder->query("//*[contains(concat(' ', normalize-space(@aria-label), ' '), 'Zutaten')]")->item(0);

    // check, ob ein Rezept existiert
    if ($zutaten == null) exit("no recipe found on page " . $url);

    // Parst jedes Rezept einzel
    $recipes = array();
    $i = 0;
    foreach ($zutaten->getElementsByTagName("tbody") as $liste) {
        // Rezept hinzufügen
        array_push($recipes, generateSwissmilkRecipe($finder, $liste));
        $i = $i + 1;
    }

    // erstellt das JSON Objekt
    $recipeJson = null;
    // Suche nach der baseMeasure: Suche im root, daher '//*' als Präfix
    $baseMeasure = $finder->query("//*[contains(concat(' ', normalize-space(@class), ' '), 'IngredientsCalculator--header--text')]")->item(0);
    $recipeJson->baseMeasure = $baseMeasure->getElementsByTagName("span")->item(0)->textContent;
    $recipeJson->baseMeasureUnit = $baseMeasure->getElementsByTagName("label")->item(0)->textContent;

    $recipeJson->recipes = $recipes;
    $recipeJson->source = $url;
    $recipeJson->created = date("d. M Y");
    $recipeJson->notes = "Quelle: swissmilk.ch. © Swissmilk " . date("Y");

    // Ausgabe des JSON Objectes
    return json_encode($recipeJson, JSON_UNESCAPED_UNICODE);
}

/** 
 * List das Rezept übergebene Rezept aus. Und erstellt eine entsprechendes Object
 * 
 */
function generateSwissmilkRecipe($finder, $liste)
{

    $ingredients = array();

    // Suche in $liste nach den Zutaten. Suche in $liste, daher './/*' als Präfix
    $ingredientsObj = $finder->query(".//*[contains(concat(' ', normalize-space(@itemprop), ' '), 'recipeIngredient')]", $liste);

    foreach ($ingredientsObj as $ingredientObj) {

        $ingredient = null;

        $ingredient->measure = $ingredientObj->getElementsByTagName("span")->item(0)->textContent;
        $ingredient->unit = $ingredientObj->getElementsByTagName("span")->item(1)->textContent;
        $ingredient->food = $finder->query(".//*[contains(concat(' ', normalize-space(@class), ' '), 'Ingredient--text')]", $ingredientObj)->item(0)->textContent;

        array_push($ingredients, $ingredient);
    }

    $recipe = null;

    // titel des Rezeptes
    $recipe->title = $finder->query("//*[contains(concat(' ', normalize-space(@class), ' '), 'DetailPageHeader--title')]")->item(0)->textContent;

    // überschreibe den Titel
    $title = $finder->query(".//*[contains(concat(' ', normalize-space(@class), ' '), 'IngredientsCalculator--group--title')]", $liste)->item(0)->textContent;
    if ($title !== null) {
        $recipe->title = $title;
    }

    $recipe->ingredients = $ingredients;

    return $recipe;
}
