import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { TemplateHeaderComponent as Header } from 'src/app/_template/template-header/template-header.component';
import { Camp } from '../../_class/camp';
import { Meal } from '../../_class/meal';
import { SpecificMeal } from '../../_class/specific-meal';
import { DatabaseService } from '../../_service/database.service';
import { FirestoreSpecificRecipe } from '../../_interfaces/firestore-specific-recipe';

@Component({
  selector: 'app-edit-meal',
  templateUrl: './edit-meal.component.html',
  styleUrls: ['./edit-meal.component.sass']
})
export class EditMealComponent implements OnInit {

  public mealInfo: FormGroup;
  public specificMeal: Observable<SpecificMeal>;

  public meal: Observable<Meal>;
  private camp: Observable<Camp>;
  private campId: string;
  private mealId: string;
  private specificMealId: string;

  constructor(private route: ActivatedRoute, private formBuilder: FormBuilder, private databaseService: DatabaseService) {


    //TODO: Hier hat es eine Bug!!! Die Observer Felder sind leer und können nicht aufgefrufen werden...
    // ggf. in der Camp klasse nachschauen, wie das inizieren funktioniert!!!!


    // load camp from url
    this.route.url.subscribe(url => {
      this.campId = url[url.length - 4].path;
      this.mealId = url[url.length - 2].path;
      this.specificMealId = url[url.length - 1].path;
      // load camp, meal and specificMeal
      this.camp = this.databaseService.getCampById(this.campId);
      this.meal = this.databaseService.getMealById(this.mealId, this.specificMealId, this.campId);
      this.specificMeal = this.databaseService.getSpecificMeal(this.mealId, this.specificMealId, this.campId);

      this.camp.subscribe(camp => this.meal.subscribe(meal => this.setHeaderInfo(camp, meal)));


    });

  }

  ngOnInit() {


    this.meal.subscribe(meal => {
      this.mealInfo = this.formBuilder.group({
        title: meal.title
      });
    });



  }


  private afterGetURL(url) {

    this.campId = url[url.length - 4].path;
    this.mealId = url[url.length - 2].path;
    this.specificMealId = url[url.length - 1].path;

    // load camp, meal and specificMeal
    this.camp = this.databaseService.getCampById(this.campId);
    this.meal = this.databaseService.getMealById(this.mealId, this.specificMealId, this.campId);
    this.specificMeal = this.databaseService.getSpecificMeal(this.mealId, this.specificMealId, this.campId);

    this.camp.subscribe(camp => this.meal.subscribe(meal => this.setHeaderInfo(camp, meal)));

  }

  /** setzt die HeaderInfos für die aktuelle Seite */
  private setHeaderInfo(camp, meal): void {

    Header.title = meal.title;
    Header.path = ['eMeal', 'meine Lager', camp.name, '', '', meal.title];

  }

  newRecipe() {

    // TODO: wenn bug behoben, doppeltes laden vermeiden und anstelle dessen this.camp benützen...
    this.databaseService.getCampById(this.campId) // this.camp
      .subscribe(camp => {

        this.databaseService.addRecipe(this.mealId, this.campId).subscribe(async recipe => {

          // TODO: doppelter code its auch in der Klasse meal vorahnden -> besser methode aus meal verwenden!!!
          const recipeId = await recipe;
          const specificRecipeData: FirestoreSpecificRecipe = {
            participants: camp.participants,
            campId: camp.firestoreElementId
          };
          const recipePath = 'meals/' + this.mealId + '/recipes/' + recipeId.id + '/specificRecipes/' + this.specificMealId;
          this.databaseService.addDocument(specificRecipeData, recipePath);
        });

      });

  }

}
