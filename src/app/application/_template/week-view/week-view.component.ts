import { SelectionModel } from '@angular/cdk/collections';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material';
import { MatDialog } from '@angular/material/dialog';
import { firestore } from 'firebase';
import { Observable, of } from 'rxjs';
import { HeaderNavComponent } from 'src/app/_template/header-nav/header-nav.component';

import { Camp } from '../../_class/camp';
import { Day } from '../../_class/day';
import { Meal } from '../../_class/meal';
import { AddMealComponent } from '../../_dialoges/add-meal/add-meal.component';
import { Saveable } from '../../_service/auto-save.service';
import { DatabaseService } from '../../_service/database.service';

/**
 * Wochenübersicht eines Lagers
 *
 */
@Component({
  selector: 'app-week-view',
  templateUrl: './week-view.component.html',
  styleUrls: ['./week-view.component.sass']
})
export class WeekViewComponent implements OnInit, OnChanges, Saveable {

  // inputed fields
  @Input() camp: Camp;


  public colCounter = this.calculateCols();
  public mealsChanged = false;
  public showParticipantsWarning = false;


  constructor(
    public dialog: MatDialog,
    public dbService: DatabaseService,
    public snackBar: MatSnackBar) {

    // change number of collums when resize window
    window.addEventListener('resize', () => this.colCounter = this.calculateCols());

  }

  ngOnInit() {

    HeaderNavComponent.addToHeaderNav({
      active: false,
      description: 'Änderungen Speichern',
      name: 'Speichern',
      action: (() => this.save()),
      icon: 'save'
    }, 0);

    HeaderNavComponent.addToHeaderNav({
      active: true,
      description: 'Mahlzeiten hinzufügen',
      name: 'Mahlzeiten',
      action: (() => this.addMeal()),
      icon: 'fastfood'
    });

  }


  /**
   * updates the participantsWarning
   *
   */
  ngOnChanges() {

    // Ladte die Mahlzeiten des Lagers
    this.camp.loadMeals(this.dbService);

    this.showParticipantsWarning = false;

    this.camp.days.forEach(day => {

      if (day.getMeals() !== undefined) {

        day.getMeals().subscribe(meals =>
          meals.forEach(meal =>
            (this.showParticipantsWarning = this.showParticipantsWarning || meal.overrideParticipants)
          ));

      }

    });

  }


  public async save() {

    // Prüft, ob etwas gespeichert werden muss
    if (this.mealsChanged) {

      HeaderNavComponent.turnOff('Speichern');

      // Speichert die Mahlzeiten
      this.saveMeals();
      this.snackBar.open('Änderungen wurden erfolgreich gespeichert!', '', { duration: 2000 });

      return true;
    }

    return false;
  }

  /**
   * Drop a Meal
   */
  public drop(event: CdkDragDrop<string[]>) {

    if (!this.mealsChanged) {
      HeaderNavComponent.toggle('Speichern');
    }

    this.mealsChanged = true;

    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex);
    }
  }

  /**
   * Speichert das Lager ab.
   *
   */
  saveMeals() {

    this.saveCamp();
    // TODO: save specificMeals
    this.mealsChanged = false;

  }


  /**
   * Fügt einen neuen Tag zum Lager hinzu
   *
   */
  addNewDay() {

    const date = this.getDateOfLastDay();
    date.setDate(date.getDate() + 1);

    // Erstellt einen neuen Tag und fügt diesen hinzu
    const day = new Day({
      day_date: firestore.Timestamp.fromDate(date),
      day_description: '',
    }, this.camp.documentId);
    this.camp.days.push(day);

    this.saveCamp();

  }


  /**
   * Returns the date of the last day in the camp
   *
   */
  private getDateOfLastDay() {

    if (this.camp.days.length !== 0) {

      return new Date(this.camp.days[this.camp.days.length - 1].dateAsTypeDate);

    } else {

      // if camp is empty add a day with the date of today
      return new Date();

    }
  }

  /**
   * Speichert das Lager
   */
  public saveCamp() {

    this.dbService.updateDocument(this.camp);

  }

  /**
   * Fügt eine neue Mahlzeit hinzu.
   */
  public addMeal() {

    this.dialog.open(AddMealComponent, {
      height: '618px',
      width: '1000px',
      data: null
    }).afterClosed().subscribe((result: SelectionModel<Meal>) => {

      if (result != null) {

        result.selected.forEach(async meal => {

          // falls keine Verwendung gestzt, dann als 'Zmorgen'
          const usedAs = meal.usedAs ? meal.usedAs : 'Zmorgen';

          // update AccessData of the meal and the recipes
          this.dbService.updateAccessData(this.camp.getAccessData(), meal.path);
          this.dbService.getRecipes(meal.documentId).subscribe(recipes => recipes.forEach(
            recipe => this.dbService.updateAccessData(this.camp.getAccessData(), recipe.path)
          ));

          // erstellt die specifischen Rezepte und Mahlzeiten
          const specificMealId = await meal.createSpecificMeal(this.dbService, this.camp, this.camp.days[0], usedAs);
          meal.createSpecificRecipes(this.dbService, this.camp, specificMealId);

        });

      }

    });

  }





  public deleteMeal(mealId: string, specificMealId: string) {

    document.getElementById(specificMealId).classList.add('hidden');

    const snackBar = this.snackBar.open('Mahlzeit wurde entfehrnt.', 'Rückgängig', { duration: 4000 });

    let canDelete = true;
    snackBar.onAction().subscribe(() => {
      canDelete = false;
      document.getElementById(specificMealId).classList.toggle('hidden');

    });
    snackBar.afterDismissed().subscribe(() => {

      if (canDelete) {

        this.saveCamp();
        this.dbService.deleteSpecificMealAndRecipes(mealId, specificMealId);
      }

    });

  }

  public editDay(save: number, day: Day, meals: Meal[]) {


    if (save === 1) {
      this.mealsChanged = true;

    } else if (save === -1) {

      this.camp.days.splice(this.camp.days.indexOf(day), 1);

      if (meals !== undefined) {
        meals.forEach(meal => {
          this.dbService.deleteSpecificMealAndRecipes(meal.documentId, meal.specificId);
        });
      }

      this.mealsChanged = true;
      this.save();

    }

  }

  private calculateCols() {

    return Math.floor(document.body.scrollWidth / 340);
  }


}
