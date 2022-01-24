import {SelectionModel} from '@angular/cdk/collections';
import {Component, Input, OnInit, QueryList, ViewChildren} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {combineLatest, Observable, of} from 'rxjs';
import {mergeMap, take} from 'rxjs/operators';
import {Camp} from '../../classes/camp';
import {Day} from '../../classes/day';
import {Meal} from '../../classes/meal';
import {SpecificMeal} from '../../classes/specific-meal';
import {AddMealComponent} from '../../dialoges/add-meal/add-meal.component';
import {Saveable} from '../../services/auto-save.service';
import {DatabaseService} from '../../services/database.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {MealUsage} from '../../interfaces/firestoreDatatypes';
import {DayOverviewComponent} from '../day-overview/day-overview.component';
import firebase from "firebase/compat/app";
import Timestamp = firebase.firestore.Timestamp;
import {HeaderNavComponent} from "../../../../shared/components/header-nav/header-nav.component";

/**
 * Week-Overview of a camp: This component renders the week-overview of a camp.
 * It provides drag and drop support for meals between days and meals.
 *
 *  TODO: add short-cut for adding meal (shift + M)
 *  TODO: add short-cut for adding day (shift + D)
 *
 */
@Component({
  selector: 'app-week-overview',
  templateUrl: './week-overview.component.html',
  styleUrls: ['./week-view.component.sass'],
})
export class WeekOverviewComponent implements OnInit, Saveable {


  /** The camp for which this component should create the week-overview. */
  @Input() camp: Camp;

  /** Number of columns (i.g. days) that have space on the screen */
  public showNColumns = WeekOverviewComponent.calculateCols();
  /** Whether or not the user has write-access to this camp. */
  public hasWriteAccess = false;
  /** Stores a list of all meals that get prepared on another day */
  public mealToPrepare: Observable<SpecificMeal[]>;

  /** List of all day-overview */
  @ViewChildren(DayOverviewComponent) dayOverviews: QueryList<DayOverviewComponent>;

  constructor(
    public dialog: MatDialog,
    public dbService: DatabaseService,
    public snackBar: MatSnackBar) {

    // Change number of columns (i.g. days) when the window gets resized
    window.addEventListener('resize', () =>
      this.showNColumns = WeekOverviewComponent.calculateCols());

  }

  /**
   * Calculates the number (i.g. days) of columns that have space on the screen width.
   * @returns: the number of columns
   */
  private static calculateCols() {
    return Math.floor(document.body.scrollWidth / 340);
  }

  ngOnInit() {

    // Check whether the user as write-access to the camp.
    // The result get sored in the local var hasWriteAccess on top of that
    // if the user has access, the "Speichern" "Mahlzeiten" button are created.
    this.dbService.canWrite(this.camp).then(hasAccess => {

      this.hasWriteAccess = hasAccess;

      HeaderNavComponent.addToHeaderNav({
        active: false,
        description: 'Änderungen Speichern',
        name: 'Speichern',
        action: (() => this.save()),
        icon: 'save'
      }, 0);

      HeaderNavComponent.addToHeaderNav({
        active: this.hasWriteAccess,
        description: 'Mahlzeiten hinzufügen',
        name: 'Mahlzeiten',
        action: (() => this.addMeal()),
        icon: 'fastfood'
      });

    });

    // save a list of meals that gets prepared on another day
    this.mealToPrepare = this.dbService.getPreparedMeals(this.camp?.documentId);

  }


  /**
   * Saves the camp.
   * @returns: Promise<boolean> resolving once the save process has been successfully finished. The promise always
   * resolve with a value true, since the camp get saved regardless if it got changed or not.
   */
  public async save() {

    // Speichert das Lager
    await this.dbService.updateDocument(this.camp);
    HeaderNavComponent.turnOff('Speichern');

    return true;
  }

  /**
   * Action executed after a meal has been dropped into another meal or day (drag and drop of meals in week-overview).
   *
   * @param specificMeal: reference to the meal that got dropped
   * @param usedAs: the new use case
   * @param mealDateAsString: the new date as a string (UNIX)
   */
  public async drop([specificMeal, usedAs, mealDateAsString]: [SpecificMeal, MealUsage | 'Vorbereiten', string]) {

    // update meal date, i.g. move the meal to the correct day
    specificMeal.date = Timestamp.fromMillis(Number.parseInt(mealDateAsString, 10));
    specificMeal.usedAs = usedAs as MealUsage;

    HeaderNavComponent.turnOn('Speichern');

    // check if meal gets prepared, if so, check if the prepare date is older than the meal usage.
    // If that is the case the prepare will be deactivated
    if (specificMeal.prepareAsDate.getTime() >= specificMeal.date.toDate().getTime() && specificMeal.prepare) {
      specificMeal.prepare = false;
      this.snackBar.open('Vorbereitung der Mahlzeit wurde deaktiviert!', '', {duration: 2000});
    }

    await this.dbService.updateDocument(specificMeal);

  }


  /**
   * Fügt einen neuen Tag zum Lager hinzu.
   *
   */
  addNewDay() {

    this.save();

    const date = this.getDateOfLastDay();
    date.setDate(date.getDate() + 1);

    // Erstellt einen neuen Tag und fügt diesen hinzu
    const day = new Day({
      day_date: Timestamp.fromDate(date),
      day_description: '',
      day_notes: ''
    }, this.camp.documentId);
    this.camp.days.push(day);

    // Ladet die Mahlzeiten neu, damit auch der neue Tag sein Array zugesprochen bekommt.
    // Anstonsten führt das verschieben von Mahlzeitn zu einem Fehler
    this.camp.loadMeals(this.dbService);
    this.camp.sortDays();

    this.saveCamp();

  }

  /**
   * Speichert das Lager
   */
  public saveCamp(): Observable<Camp> {

    this.dbService.updateDocument(this.camp);

    return of(this.camp);

  }

  /**
   * Fügt eine neue Mahlzeit hinzu.
   *
   */
  public addMeal(dayIndex: number = 0, usage?: MealUsage) {


    // Create data fo dialog. The dataset contains all meals already used in the camp
    // this allows the dialog to sort and rank the meals.
    combineLatest(this.camp.days.map(day => day.getMeals().pipe(take(1))))
      .pipe(take(1))
      .pipe(mergeMap((meals: SpecificMeal[][]) => {

        // create array with names of meals
        const mealNames = meals.flat().map(m => m.weekTitle);

        // save the current camp
        this.save();

        return this.dialog.open(AddMealComponent, {
          height: '618px',
          width: '1000px',
          data: {mealNames, usage},
        }).afterClosed();

      })).subscribe((result: SelectionModel<Meal>) => {

      if (result != null) {

        result.selected.forEach(async meal => {

          // TODO: combine in one database write....

          // falls keine Verwendung gesetzt, dann als 'Zmorgen'
          const usedAs = usage ? usage : (meal.usedAs ? meal.usedAs : 'Zmorgen');

          const day = this.camp.days[dayIndex];
          const mealsOfDay = await new Promise<SpecificMeal[]>(resolve =>
            day.getMeals().pipe(take(1)).subscribe(meals => resolve(meals)));

          // skip meal if already a meal is at this place...
          if (mealsOfDay.filter(m => m.usedAs === usedAs).length > 0) {
            console.log('Skip creation of meal at day Nr. ' + dayIndex + ' as ' + usedAs + '.');
            this.snackBar.open('Mahlzeit wurde nicht hinzugefügt! Platz bereits besetzt!', 'Schliessen', {duration: 4000});
            return;
          }

          console.log('Create meal at day Nr. ' + dayIndex + ' as ' + usedAs);

          // add campId to usedInCamps
          if (!meal.usedInCamps.includes(this.camp.documentId)) {
            meal.usedInCamps.push(this.camp.documentId);
            await this.dbService.updateDocument(meal);
          }

          console.log('Add campID');
          this.updateContextMenus();

          // erstellt die spezifischen Rezepte und Mahlzeiten
          const specificMealId = await new Promise<string>(res => {
            meal.createSpecificMeal(this.dbService, this.camp, day, usedAs)
              .then(mealID => res(mealID))
              .catch(console.log);
          });

          console.log('Create specificMealId: ' + specificMealId);

          if (specificMealId === undefined || specificMealId === null) {
            console.error('Problem can\'t add meal.');
            return;
          }

          await meal.createSpecificRecipes(this.dbService, this.camp, specificMealId);
          console.log('After Update Meal');

          this.updateContextMenus();

          setTimeout(() => this.updateAccess(meal), 0);

        });
      }
    });

  }

  /**
   * Löscht die ausgewählt Mahlzeit.
   *
   */
  public deleteMeal(mealId: string, elementID: string) {

    console.log('   >>> Delete Meal');

    // versteckt das Element aus dem GUi
    document.querySelectorAll('[data-meal-id=ID-' + elementID + ']')?.forEach(el => el?.classList.add('hidden'));

    this.dbService.deleteSpecificMealAndRecipes(mealId, elementID);
    this.updateContextMenus();

  }

  /**
   * Bearbeitet den Tag.
   *
   */
  public editDay(save: number, day: Day, meals: SpecificMeal[]) {


    if (save === -1) {

      this.camp.days.splice(this.camp.days.indexOf(day), 1);


      // löscht die specifischen Rezepte und Mahlzeiten des Tages
      meals.forEach(specificMeal => {

        const mealId = specificMeal.getMealId();
        this.dbService.deleteSpecificMealAndRecipes(mealId, specificMeal.documentId);

      });


    }

    // Ändert das Datum aller Mahlzeiten
    meals.forEach(specificMeal => {
      specificMeal.date = day.getTimestamp();
      this.dbService.updateDocument(specificMeal);
    });

    // Ladet die Mahlzeiten neu, anstonsten führt das verschieben von Mahlzeitn zu einem Fehler
    this.camp.loadMeals(this.dbService);
    this.camp.sortDays();


    // Speichert die Änderungen
    this.save();

  }

  getSpecificMealsOfDay(day: Day) {

    return day.getMeals();


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
      const date = new Date();
      date.setHours(0, 0, 0, 0);
      return date;

    }
  }

  private updateAccess(meal: Meal) {

    console.log('updateAccess stared');


    try {

      // request for update rights for meals, recipes and specificMeals and specificRecipes
      this.dbService.refreshAccessData(this.camp.documentId, meal.path)
        .subscribe(console.log, error => console.log(error));

    } catch (err) {
      console.log(err);
    }

  }

  private updateContextMenus() {
    this.dayOverviews.forEach(el => el.setContextMenu());
  }

}
