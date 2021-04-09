import admin = require('firebase-admin');

import { db } from '..';
import { ExportedRecipe } from '../interfaces/exportDatatypes';
import { Ingredient } from '../interfaces/firestoreDatatypes';

export type ShoppingList = ShoppingListCategory[];
export interface ShoppingListCategory {
    categoryName: string;
    ingredients: Ingredient[];
}

interface InternalShoppingList {
    [category: string]: ShoppingListItems;
}
interface ShoppingListItems {

    [food: string]: {
        measure: number;
        unit: string;
        comment: string;
        fresh: boolean;
    }

}

export interface Units {

    [search_query: string]: {

        base_from: string;
        base_unit: string;
        factor: number;
        only_for_food_item: string

    };

}

export interface Categories {
    [food_item: string]: {

        category_name: string;
        sub_category: string;
        base_unit: string

    };
}

/**
 * Helps to create a ShoppingList
 * 
 * Combines ingredients of recipes to create a shoppingList
 * 
 */
export class ShoppingListCreator {

    private internalList: InternalShoppingList;
    private categories: Categories;
    private units: Units;

    constructor(categories: Categories, units: Units) {

        this.internalList = {};

        this.categories = categories;
        this.units = units;

    }

    /**
     * 
     * Fügt ein Rezept zur ShoppingList hinzu.
     * Dabei werden Frischprodukte als solche gekennzeichnet.
     * 
     * @param recipe Rezept mit den Zutaten
     * @markFreshProducts = Falls true werden die Frischprodukte gekennzeichnet (default value = true)
     * 
     */
    public addRecipe(recipe: ExportedRecipe, markFreshProducts = true) {

        recipe.ingredients.forEach(ingOrig => {

            // clones the ingredient
            // Damit die original Daten in den Rezepten nicht überschrieben werden...
            const ing = JSON.parse(JSON.stringify(ingOrig))

            const catName = this.getCatName(ing);
            ing.measure = ing.measure * recipe.recipe_participants;
            this.toBaseUnit(ing);

            // mark fresh products
            if (ing.fresh && markFreshProducts) {
                ing.food += ' (Frischprod.)';
            }

            // Remove heading/tailing space
            ing.food = ing.food.trim();

            // adds ingredient
            this.addIngredient(ing, catName);

        });

    }

    /**
     * Convertiert ein Ingredient in die BaseUnit. 
     * 
     * Hierzu wird das Lebensmittel zuerst in die Basiseinheit
     * umgerechnet (d.h. z.B. Gramm werden in Kilogramm umgerechnet).
     * Anschliessen wird (falls vorhanden) eine spezischische Umrechnung
     * von einer Basisheinheit zu einer anderen Basiseinheit vorgenommen.
     * 
     * Dies bringt den Vorteil mit sich, dass spezifische Umrechnungen nur 
     * zwischen den Basiseinheiten definiert sein müssen.
     *  
     * @param ing Zutat die Umgerechnet werden soll.
     * 
     */
    private toBaseUnit(ing: Ingredient) {

        // search for unit transformation
        let query = ing.unit + ':';
        if (this.units[query] !== undefined) {
            ing.unit = this.units[query].base_unit;
            ing.measure = ing.measure * this.units[query].factor;

        } else {

            // Ist eine Einheit nicht bekannt, so gibt dies keinen Fehler.
            // Das Food Item wird einfach unverändert gelassen, dennoch wird diese
            // Umbekannte einheit notiert:

            // write unknown unit to document in 'sharedData/unknownUnits'
            db.doc('sharedData/unknownUnits')
                .update({ uncategorised: admin.firestore.FieldValue.arrayUnion(ing.unit) })
                .catch(e => console.error(e));

        }

        // search for specific transformation
        query = ing.unit + ':' + ing.food;
        if (this.units[query] !== undefined) {
            ing.unit = this.units[query].base_unit;
            ing.measure = ing.measure * this.units[query].factor;
        }

    }

    /**
     * Searches for the category of the ingredient
     * 
     * @param ing Zutat für die die Kategorie gesucht wird.
     * @returns the name of the category of the ingredient
     * 
     */
    private getCatName(ing: Ingredient) {

        // Kategorie gefunden
        if (this.categories[ing.food] !== undefined) {

            return this.categories[ing.food].category_name;
        }

        // suche nach ähnlichen Begrffen...
        for (const ingName in this.categories) {

            if (ing.food.includes(ingName)) {
                return this.categories[ingName].category_name;

            }

        }

        // write unknown unit to document in 'sharedData/foodCategories'
        db.doc('sharedData/foodCategories')
            .update({ uncategorised: admin.firestore.FieldValue.arrayUnion(ing.food) })
            .catch(e => console.error(e));

        // Default Kategorie
        return 'Diverses';

    }

    /**
     * 
     * Adds all the Items of the shoppinglist to the 
     * InternalShoppingList.
     * 
     * @param shoppingList shoppingList to add to the current shoppingList
     * 
     */
    public mergeShoppingList(shoppingList: ShoppingList) {

        if (shoppingList === undefined) {
            return;
        }

        // merges the shoppingLists
        shoppingList.forEach(cat => {
            cat.ingredients.forEach(ing => this.addIngredient(ing, cat.categoryName));
        });

    }

    /**
     * 
     * Adds an ingredient to the shopping list.
     * Adds the ingredient to the given category.
     * 
     * @param ing 
     * @param categoryName 
     */
    private addIngredient(ing: Ingredient, categoryName: string, suffix: string = '') {

        // category does not exist --> create category
        if (this.internalList[categoryName] === undefined) {
            this.internalList[categoryName] = {};
        }

        // if food exist --> add up measure
        if (this.internalList[categoryName][ing.food + suffix] !== undefined) {

            // on different units...
            if (this.internalList[categoryName][ing.food + suffix].unit !== ing.unit) {

                if (suffix === '') {

                    this.addIngredient(ing, categoryName, ' [in ' + ing.unit + ']')

                } else {

                    this.addIngredientToLocalList(categoryName, ing, suffix);

                }

            } else {

                this.internalList[categoryName][ing.food + suffix].measure += ing.measure;
            }
        }
        else {
            // add the food item to the list
            this.addIngredientToLocalList(categoryName, ing, suffix);
        }

    }

    private addIngredientToLocalList(categoryName: string, ing: Ingredient, suffix: string) {

        this.internalList[categoryName][ing.food + suffix] = {
            measure: ing.measure,
            comment: ing.comment,
            unit: ing.unit,
            fresh: ing.fresh
        };

    }

    /**
     * Exports the ShoppingList as a ShoppingList object
     * 
     */
    public getShoppingList(): ShoppingList {

        // erstellt eine Leere ShoppingList
        const shoppingList: ShoppingList = [];

        for (const categoryName in this.internalList) {

            const shoppingListCategory: ShoppingListCategory = {
                categoryName,
                ingredients: []
            };

            for (const foodName in this.internalList[categoryName]) {

                const shoppingListItem = this.internalList[categoryName][foodName];

                const ingredient = {
                    food: foodName,
                    measure: shoppingListItem.measure,
                    comment: shoppingListItem.comment,
                    unit: shoppingListItem.unit,
                    fresh: shoppingListItem.fresh
                };

                shoppingListCategory.ingredients.push(ingredient);

            }

            shoppingList.push(shoppingListCategory);

        }


        // Sortieren der Kategorien
        shoppingList.sort((a, b) => a.categoryName.localeCompare(b.categoryName));

        // Sortieren der Zutaten
        shoppingList.forEach(cat => cat.ingredients.sort((a, b) => a.food.localeCompare(b.food)));

        return shoppingList;

    }

}
