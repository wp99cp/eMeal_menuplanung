import {ExportedCamp, ExportedMeal} from '../interfaces/exportDatatypes';
import {ShoppingList} from './shopping-list';

/**
 *
 * Manipulates the HTML file "lagerhandbuch.html" to create a
 * HTML document for printing the lagerhandbuch.
 *
 * This function get exicuted in a browser environment in puppeteer.
 *
 * @param data exportedCamp Data
 *
 */
export const createHTML = (camp: ExportedCamp) => {

        /**
         *
         */
        const setTitlePage = function () {

            // Sets Lagerhandbuch title on the first page
            let domElm = document.querySelector('.val-camp-name') as Element;
            domElm.innerHTML = camp.camp_name;

            // sets the version on the first page
            domElm = document.querySelector('.val-current-date') as Element;
            domElm.innerHTML = 'Version vom ' + new Date().toLocaleDateString('de-CH', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                timeZone: 'Europe/Zurich'
            });

        };

        /**
         *
         */
        const createInfoPage = function () {

            // set Vegis, leaders and participants
            let domElm = document.querySelector('.val-vegis') as Element;
            domElm.innerHTML = camp.camp_vegetarians.toString();

            domElm = document.querySelector('.val-leaders') as Element;
            domElm.innerHTML = camp.camp_leaders.toString();

            domElm = document.querySelector('.val-participants') as Element;
            domElm.innerHTML = camp.camp_participants.toString();

            // set camp description
            domElm = document.querySelector('.val-description') as Element;
            domElm.innerHTML = camp.camp_description;

            // set camp description
            domElm = document.querySelector('.page-title') as Element;
            domElm.innerHTML = camp.camp_name;

            let innerHTMLStr = '';

            for (const day of camp.days) {

                innerHTMLStr += '- ' + new Date(day.day_date_as_date).toLocaleDateString('de-CH', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    timeZone: 'Europe/Zurich'
                });
                innerHTMLStr += day.day_notes !== '' ? ': ' + day.day_notes : '';
                innerHTMLStr += '<br>';

            }

            domElm = document.querySelector('.days-notes') as Element;
            domElm.innerHTML = innerHTMLStr;

            // set Dauer
            domElm = document.querySelector('.val-dauer') as Element;
            domElm.innerHTML = new Date(camp.days[0].day_date_as_date).toLocaleDateString('de-CH', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    timeZone: 'Europe/Zurich'
                }) +
                ' bis ' + new Date(camp.days[camp.days.length - 1].day_date_as_date).toLocaleDateString('de-CH', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    timeZone: 'Europe/Zurich'
                }) +
                ' (' + camp.days.length + ' Tage)';

        }

        const addMealsToWeekView = function (meals: ExportedMeal[]) {

            const str = '<td><p class="meal_in_weekview">';
            let str2 = '';
            for (const meal of meals) {
                if (str2 !== '') {
                    str2 += '<br><br>';
                }
                str2 += meal.meal_weekview_name;
            }
            return str + str2 + '</p></td>';

        };

        /**
         *
         */
        const createWeekView = function () {

            const mealUsages = ["Leitersnack", "Znacht", "Zvieri", "Zmittag", "Znüni", "Zmorgen"];

            let innerHTMLStr = '<table id="weekTable">';

            // Verwendungen
            innerHTMLStr += '<tr><td><p> Vorbereiten </p></td>';
            for (const mealUsage of mealUsages) {
                innerHTMLStr += '<td><p>' + mealUsage + '</p></td>';
            }
            innerHTMLStr += '<th></th></tr>';

            // Vor dem Lager
            if (camp.meals_to_prepare.length > 0) {

                innerHTMLStr += '<tr>';
                innerHTMLStr += addMealsToWeekView(camp.meals_to_prepare);

                for (const _mealUsage of mealUsages) {
                    innerHTMLStr += '<td></td>';
                }

                innerHTMLStr += '<th><p> Vor dem Lager </p></th></tr>';

            }

            for (const day of camp.days) {

                innerHTMLStr += '<tr>';
                innerHTMLStr += addMealsToWeekView(day.meals_to_prepare);

                for (const mealUsage of mealUsages) {
                    innerHTMLStr += addMealsToWeekView(day.meals.filter(meal => (meal.meal_used_as === mealUsage)))
                }

                innerHTMLStr += '<th><p style="height: calc((100vh - 380px) / ' + (camp.days.length + 1) + ');">'
                    + new Date(day.day_date_as_date).toLocaleDateString('de-CH', {
                        weekday: 'short',
                        month: 'numeric',
                        day: 'numeric',
                        timeZone: 'Europe/Zurich'
                    })
                    + '<br>' + day.day_description + '</p></th></tr>';

            }

            innerHTMLStr += '</table>';
            const domElm = document.querySelector('.val-week-view-table') as Element;
            domElm.innerHTML = innerHTMLStr;
        }


        /**
         *
         * Creates a ShoppingList
         *
         * @param domElm Element to insert ShoppingList
         * @param list ShoppingList
         */
        const createShoppingList = function (domElm: Element, list: ShoppingList, markProducs = false) {

            for (const category of list) {

                const tbody = document.createElement('tbody');
                tbody.classList.add('category');

                const titleTr = document.createElement('tr');
                const titleTh = document.createElement('th');
                titleTh.classList.add('var-category-title');
                titleTh.innerText = category.categoryName;
                titleTr.appendChild(titleTh);
                tbody.appendChild(titleTr);

                for (const ingredient of category.ingredients) {

                    const ingredientTr = document.createElement('tr');
                    ingredientTr.classList.add('ingredient');

                    if (markProducs && !ingredient.fresh) {
                        ingredientTr.classList.add('gary-ingredient');
                    }

                    if (!markProducs && ingredient.fresh) {
                        ingredientTr.classList.add('gary-ingredient');
                    }


                    ingredientTr.innerHTML = `
                <td class="measure var-measure"> ` + ((ingredient.measure && ingredient.measure !== 0) ? ingredient.measure.toFixed(2) : '') + `  </td>
                <td class="unit var-unit"> ` + ingredient.unit + `  </td>
                <td class="food var-food"> ` + ingredient.food + `  </td>`;

                    tbody.appendChild(ingredientTr);
                }

                domElm.appendChild(tbody);

            }

        };

        const addMeals = function () {
            const dom = document.body;
            for (const day of camp.days) {

                for (const meal of day.meals) {

                    const newPage = document.createElement('article');
                    newPage.classList.add('page');
                    newPage.classList.add('meal-page');
                    newPage.innerHTML = `
                <h1 class="page-title meal-name">` + meal.meal_name + `</h1>
                <span class="meal-description">` + meal.meal_description + `</span>
                <span class="meal-date">` + new Date(meal.meal_data_as_date).toLocaleDateString('de-CH', {
                        weekday: 'long',
                        month: 'long',
                        day: '2-digit',
                        timeZone: 'Europe/Zurich'
                    }) + ' (' + meal.meal_used_as + `)</span>`;

                    const recipesNode = document.createElement('div');
                    recipesNode.classList.add('recipes');

                    for (const recipe of meal.recipes) {

                        const newRecipe = document.createElement('div');
                        newRecipe.classList.add('recipe');
                        newRecipe.innerHTML = `<h2 class = "recipe-name" > ` + recipe.recipe_name + ` </h2>
                        <span class = "recipe-description" > ` + recipe.recipe_description +
                            `</span><span class="recipe-vegi-info">` +
                            recipe.recipe_used_for + `(` + recipe.recipe_participants + ` Personen)</span>
                        <span class="recipe-notes"> ` + recipe.recipe_notes + `</span>`;

                        const ingredientsNode = document.createElement('div');
                        ingredientsNode.classList.add('ingredients');

                        ingredientsNode.innerHTML = `
                 <div class="ingredient" style="font-weight: bold;margin-bottom: 12px;">
                 <span class="ingredient-measure">1 Per.</span>
                 <span class="ingredient-measure-calc"> ` + recipe.recipe_participants + ` Per. </span>
                 <span class="ingredient-unit"></span>
                 <span class="ingredient-food">Lebensmittel</span>
                 <span class="ingredient-comment">Bemerkung</span></div>`;

                        for (const ingredient of recipe.ingredients) {

                            const newIngredient = document.createElement('div');
                            newIngredient.classList.add('ingredient');
                            newIngredient.innerHTML = `
                    <span class="ingredient-measure">` + (ingredient.measure ? (ingredient.measure * 1).toFixed(2) : '') + `</span>
                    <span class="ingredient-measure-calc">` + (ingredient.measure ? (ingredient.measure * recipe.recipe_participants).toFixed(2) : '') + `</span>
                    <span class="ingredient-unit">` + ingredient.unit + `</span>
                    <span class="ingredient-food">` + ingredient.food + `</span>
                    <span class="ingredient-comment">` + ingredient.comment + `</span>`;

                            ingredientsNode.appendChild(newIngredient);
                        }

                        newRecipe.appendChild(ingredientsNode);
                        recipesNode.appendChild(newRecipe);
                    }

                    newPage.appendChild(recipesNode);
                    dom.appendChild(newPage);

                }

            }
        };

        const addDayShoppingLists = function () {

            camp.days.forEach(day => {

                // scipps empty shoppingLists
                if (day.shoppingList.length === 0) {
                    return;
                }

                const newPage = document.createElement('article');
                newPage.classList.add('page');
                newPage.innerHTML = `<h1 class="page-title"> Einkaufsliste `
                    + new Date(day.day_date_as_date).toLocaleDateString('de-CH', {
                        weekday: 'long',
                        month: 'numeric',
                        day: 'numeric',
                        timeZone: 'Europe/Zurich'
                    })
                    + `</h1>`;

                const shoppingListElem = document.createElement('table');
                shoppingListElem.classList.add('shopping-list');
                newPage.appendChild(shoppingListElem);
                createShoppingList(shoppingListElem, day.shoppingList, true);
                document.body.appendChild(newPage);


            });

        }

// Setzt das HTML File zusammen
        setTitlePage();
        createInfoPage();
        createWeekView();

        const shoppingList = document.querySelector('.shopping-list') as Element;
        createShoppingList(shoppingList, camp.shoppingList, false);

        addDayShoppingLists();

        addMeals();

    }
;
