import {Component, OnInit} from '@angular/core';
import {Clipboard} from '@angular/cdk/clipboard';
import {MatSnackBar} from '@angular/material/snack-bar';
import {Observable} from 'rxjs';
import {AdminService, FoodCategories, FoodCategoryDecision, SpellingCorrection} from '../../services/admin.service';

@Component({
  standalone: false,
  selector: 'app-food-categories',
  templateUrl: './food-categories.component.html',
  styleUrls: ['./food-categories.component.sass']
})
export class FoodCategoriesComponent implements OnInit {

  public readonly categoriesFile =
    'https://github.com/wp99cp/eMeal_menuplanung/blob/develop/backend/pdf-export-module/script/shopping_list/categories.csv';

  public food: Observable<FoodCategories>;

  // the categories of the shopping list, undefined until they are loaded
  public categoryNames: string[] | undefined;
  public categoryNamesFailed = false;

  constructor(private admin: AdminService,
              private clipboard: Clipboard,
              private snackBar: MatSnackBar) {
  }

  ngOnInit(): void {

    this.food = this.admin.getFoodCategories();

    this.admin.getCategoryNames()
      .then(names => this.categoryNames = names)
      .catch(error => {
        console.error(error);
        this.categoryNamesFailed = true;
      });

  }

  assign(food: string, category: string) {

    if (category === '') {
      return;
    }

    this.admin.assignCategory(food, category)
      .then(() => this.snackBar.open(food + ' gehört jetzt zu «' + category + '».', '', {duration: 2500}));

  }

  ignore(food: string) {
    this.admin.ignoreFood(food);
  }

  accept(correction: SpellingCorrection) {
    this.admin.acceptCorrection(correction);
  }

  reject(correction: SpellingCorrection) {
    this.admin.rejectCorrection(correction);
  }

  remove(list: 'categories' | 'ignored' | 'acceptedCorrections' | 'rejectedCorrections',
         entry: string | SpellingCorrection | FoodCategoryDecision) {
    this.admin.removeDecision(list, entry);
  }

  numberOfDecisions(food: FoodCategories): number {
    return food.categories.length + food.ignored.length +
      food.acceptedCorrections.length + food.rejectedCorrections.length;
  }

  /**
   * Copies the assigned categories as lines of categories.csv.
   */
  copyAsCSV(decisions: FoodCategoryDecision[]) {

    const escape = (value: string) => /[",\n]/.test(value) ? '"' + value.replace(/"/g, '""') + '"' : value;
    const lines = decisions.map(({food_item, category_name}) => escape(food_item) + ',' + escape(category_name) + ',');

    this.clipboard.copy(lines.join('\n') + '\n');
    this.snackBar.open(lines.length + ' Zeilen kopiert.', '', {duration: 2500});

  }

}
