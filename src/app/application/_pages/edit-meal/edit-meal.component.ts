import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { map, mergeMap, take } from 'rxjs/operators';
import { TemplateHeaderComponent as Header } from 'src/app/_template/template-header/template-header.component';

import { Camp } from '../../_class/camp';
import { Meal } from '../../_class/meal';
import { SpecificMeal } from '../../_class/specific-meal';
import { Saveable } from '../../_service/auto-save.service';
import { DatabaseService } from '../../_service/database.service';
import { EditRecipeComponent } from '../../_template/edit-recipe/edit-recipe.component';

@Component({
  selector: 'app-edit-meal',
  templateUrl: './edit-meal.component.html',
  styleUrls: ['./edit-meal.component.sass']
})
export class EditMealComponent implements OnInit, Saveable {

  public indexOfOpenedPanel = -1;
  public mealInfo: FormGroup;
  public specificMeal: Observable<SpecificMeal>;
  public meal: Observable<Meal>;
  public camp: Observable<Camp>;
  private campId: Observable<string>;
  private mealId: Observable<string>;
  private specificMealId: Observable<string>;

  @ViewChildren(EditRecipeComponent) editRecipes: QueryList<EditRecipeComponent>;


  constructor(private route: ActivatedRoute, private formBuilder: FormBuilder, private databaseService: DatabaseService) { }

  public newOpened(index: number) {

    console.log(index);
    this.indexOfOpenedPanel = index;

  }

  ngOnInit() {

    // Objecte definieren
    this.campId = this.route.url.pipe(map(url => url[url.length - 4].path));
    this.mealId = this.route.url.pipe(map(url => url[url.length - 2].path));
    this.specificMealId = this.route.url.pipe(map(url => url[url.length - 1].path));
    this.camp = this.campId.pipe(mergeMap(id => this.databaseService.getCampById(id)));
    this.meal = this.campId.pipe(mergeMap(campId =>
      this.mealId.pipe(mergeMap(mealId =>
        this.specificMealId.pipe(mergeMap(specificMealId =>
          this.databaseService.getMealById(mealId, specificMealId, campId)
        ))
      ))
    ));

    this.specificMeal = this.campId.pipe(mergeMap(campId =>
      this.mealId.pipe(mergeMap(mealId => this.specificMealId.pipe(mergeMap(specificMealId =>
        this.databaseService.getSpecificMeal(mealId, specificMealId, campId)
      ))))));

    this.specificMeal.subscribe(specificMeal =>
      this.meal.subscribe(meal => {
        this.mealInfo = this.formBuilder.group({

          title: meal.name,
          description: meal.description,

          // der weekTitle eines spezifischenMeal muss nicht zwingend gesetzt sein...
          // in diesem Fall wird der meal.title übernommen und bei der nächsten Speicherung abgespeichert
          weekTitle: specificMeal.weekTitle !== '' ? specificMeal.weekTitle : meal.name,
          overrideParticipants: specificMeal.overrideParticipants,
          participants: specificMeal.participants

        });
      }));

    // set header Info
    this.meal.subscribe(meal => this.camp.subscribe(camp => this.setHeaderInfo(camp, meal)));

  }




  /**
   * save on destroy (only if changed)
   *
   */
  public async save(): Promise<boolean> {

    let hasChanges = false;

    // save childs
    await this.editRecipes.forEach(async editRecipe => {
      editRecipe.save().then(changes => { hasChanges = hasChanges || changes; });
    });

    if (this.mealInfo.touched) {
      console.log('Autosave Meal');
      await this.saveMeal();
      return true;
    }

    return hasChanges;

  }


  public async saveMeal() {

    // update meal
    const mealSubs = this.meal.subscribe(meal => {

      meal.description = this.mealInfo.value.description;
      meal.name = this.mealInfo.value.title;

      this.databaseService.updateDocument(meal.extractDataToJSON(), meal.getDocPath());

      // reset: deactivate save button
      this.mealInfo.markAsUntouched();
      mealSubs.unsubscribe();

    });


    // update specificMeal
    const specificMealSubs = this.specificMeal.subscribe(specificMeal => {

      specificMeal.weekTitle = this.mealInfo.value.weekTitle;
      specificMeal.overrideParticipants = this.mealInfo.value.overrideParticipants;
      specificMeal.participants = this.mealInfo.value.participants;

      this.databaseService.updateDocument(specificMeal.extractDataToJSON(), specificMeal.getDocPath());

      // reset: deactivate save button
      this.mealInfo.markAsUntouched();
      specificMealSubs.unsubscribe();

    });


  }

  /** setzt die HeaderInfos für die aktuelle Seite */
  private setHeaderInfo(camp, meal): void {

    Header.title = meal.name;
    Header.path = ['Startseite', 'meine Lager', camp.name, '', '', meal.name];

  }

  /**
   * Erstellt ein neues Rezept.
   *
   * Um Datenverluste zu vermeiden werden zuerst alle offenen Änderungen
   * der anderen Rezepte gespeichert.
   *
   */
  newRecipe() {

    this.save();

    this.meal.pipe(take(1)).subscribe(meal =>
      this.databaseService.addNewRecipe(meal.firestoreElementId, meal.access, meal.name)
    );

  }

}
