import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
import { TemplateHeaderComponent as Header } from 'src/app/_template/template-header/template-header.component';
import { Camp } from '../../_class/camp';
import { Meal } from '../../_class/meal';
import { SpecificMeal } from '../../_class/specific-meal';
import { DatabaseService } from '../../_service/database.service';

@Component({
  selector: 'app-edit-meal',
  templateUrl: './edit-meal.component.html',
  styleUrls: ['./edit-meal.component.sass']
})
export class EditMealComponent implements OnInit {

  public mealInfo: FormGroup;
  public specificMeal: Observable<SpecificMeal>;
  public meal: Observable<Meal>;
  public camp: Observable<Camp>;
  private campId: Observable<string>;
  private mealId: Observable<string>;
  private specificMealId: Observable<string>;

  constructor(private route: ActivatedRoute, private formBuilder: FormBuilder, private databaseService: DatabaseService) { }

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

          title: meal.title,
          description: meal.description,

          // der weekTitle eines spezifischenMela muss nicht zwingend gesetzt sein...
          // in diesem Fall wird der meal.title übernommen und bei der nächsten Speicherung abgespeichert
          weekTitle: specificMeal.weekTitle !== '' ? specificMeal.weekTitle : meal.title,
          overrideParticipants: specificMeal.overrideParticipants,
          participants: specificMeal.participants

        });
      }));

    // set header Info
    this.meal.subscribe(meal => this.camp.subscribe(camp => this.setHeaderInfo(camp, meal)));

  }

  public saveMeal() {

    // update meal
    const mealSubs = this.meal.subscribe(meal => {

      meal.description = this.mealInfo.value.description;
      meal.title = this.mealInfo.value.title;

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

    Header.title = meal.title;
    Header.path = ['eMeal', 'meine Lager', camp.name, '', '', meal.title];

  }

  newRecipe() {

    this.campId.pipe(mergeMap(campId =>
      this.meal.pipe(mergeMap(meal =>
        this.databaseService.addRecipe(meal.firestoreElementId, campId, meal.title)
      ))
    )).subscribe();

  }

}
