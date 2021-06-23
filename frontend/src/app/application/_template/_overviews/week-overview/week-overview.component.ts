import {SelectionModel} from '@angular/cdk/collections';
import {ChangeDetectorRef, Component, Input, OnChanges, OnInit} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {firestore} from 'firebase/app';
import {combineLatest, Observable, of} from 'rxjs';
import {mergeMap, take} from 'rxjs/operators';
import {HeaderNavComponent} from 'src/app/_template/header-nav/header-nav.component';
import {Camp} from '../../../_class/camp';
import {Day} from '../../../_class/day';
import {Meal} from '../../../_class/meal';
import {SpecificMeal} from '../../../_class/specific-meal';
import {AddMealComponent} from '../../../_dialoges/add-meal/add-meal.component';
import {Saveable} from '../../../_service/auto-save.service';
import {DatabaseService} from '../../../_service/database.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {MealUsage} from '../../../_interfaces/firestoreDatatypes';

/**
 * Wochenübersicht eines Lagers
 *
 */
@Component({
  selector: 'app-week-overview',
  templateUrl: './week-overview.component.html',
  styleUrls: ['./week-view.component.sass'],
})
export class WeekOverviewComponent implements OnInit, OnChanges, Saveable {

  // TODO: add short-cut for adding meal (shift + M)
  // TODO: add short-cut for adding day (shift + D)

  // inputed fields
  @Input() camp: Camp;

  public colCounter = this.calculateCols();
  public showParticipantsWarning = false;
  public specificMealsToSave: SpecificMeal[] = [];
  public hasAccess = false;
  public mealToPrepare: Observable<SpecificMeal[]>;

  public modelSaved = true;

  constructor(
    public dialog: MatDialog,
    public dbService: DatabaseService,
    public snackBar: MatSnackBar,
    private cd: ChangeDetectorRef) {

    // change number of collums when resize window
    window.addEventListener('resize', () => this.colCounter = this.calculateCols());


  }


  ngOnInit() {

    this.dbService.canWrite(this.camp).then(hasAccess => {

      this.hasAccess = hasAccess;

      HeaderNavComponent.addToHeaderNav({
        active: false,
        description: 'Änderungen Speichern',
        name: 'Speichern',
        action: (() => this.save()),
        icon: 'save'
      }, 0);

      HeaderNavComponent.addToHeaderNav({
        active: true && this.hasAccess,
        description: 'Mahlzeiten hinzufügen',
        name: 'Mahlzeiten',
        action: (() => this.addMeal()),
        icon: 'fastfood'
      });


    });

    this.mealToPrepare = this.dbService.getPreparedMeals(this.camp?.documentId)
    this.mealToPrepare.subscribe(console.log);


  }


  /**
   * updates the participantsWarning
   *
   */
  ngOnChanges() {

    console.log('Changes!!!');

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

    // Speichert das Lager
    this.dbService.updateDocument(this.camp);

    HeaderNavComponent.turnOff('Speichern');

    // Prüft, ob etwas gespeichert werden muss
    if (this.specificMealsToSave.length > 0) {

      // Speichert die Mahlzeiten
      this.saveMeals();
      this.snackBar.open('Änderungen wurden erfolgreich gespeichert!', '', {duration: 2000});

      return true;
    }

    return false;
  }

  /**
   * Wir bei einem Drop eines Meals ausgelöst.
   *
   *
   *
   */
  public async drop([specificMeal, usedAs, mealDateAsString]: [SpecificMeal, MealUsage | 'Vorbereiten', string]) {

    // Check if the current user has access to move meals
    if (!this.hasAccess) {
      return;
    }

    // update meal date, i.g. move the meal to the correct day
    specificMeal.date = firestore.Timestamp.fromMillis(Number.parseInt(mealDateAsString, 10));
    specificMeal.usedAs = usedAs as MealUsage;

    HeaderNavComponent.turnOn('Speichern');

    // check if meal gets prepared, if so, check if the prepare date is older than the meal usage.
    // If that is the case the prepare will ve deactivated
    if (specificMeal.prepareAsDate.getTime() >= specificMeal.date.toDate().getTime() && specificMeal.prepare) {
      specificMeal.prepare = false;
      this.snackBar.open('Vorbereitung der Mahlzeit wurde deaktiviert!', '', {duration: 2000});
    }

    // mark the meal as changed
    // if (this.specificMealsToSave.indexOf(specificMeal) === -1) {
    //   this.specificMealsToSave.push(specificMeal);
    // }


    this.modelSaved = true;

    this.dbService.updateDocument(specificMeal);

    // save the meals
    // this.saveMeals();

  }


  /**
   * Speichert das Lager ab.
   *
   */
  saveMeals() {

    this.specificMealsToSave.map(meal => this.dbService.updateDocument(meal));
    this.specificMealsToSave = [];

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
      day_date: firestore.Timestamp.fromDate(date),
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
  public addMeal(dayIndex: number = 0) {


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
          data: {mealNames}
        }).afterClosed();

      })).subscribe((result: SelectionModel<Meal>) => {

      if (result != null) {

        result.selected.forEach(async meal => {

          // TODO: combine in one database write....

          // falls keine Verwendung gesetzt, dann als 'Zmorgen'
          const usedAs = meal.usedAs ? meal.usedAs : 'Zmorgen';

          const day = this.camp.days[dayIndex];
          const mealsOfDay = await new Promise<SpecificMeal[]>(resolve =>
            day.getMeals().pipe(take(1)).subscribe(meals => resolve(meals)));

          // skip meal if already a meal is at this place...
          if (mealsOfDay.filter(m => m.usedAs === usedAs).length > 0) {
            console.log('Skip creation of meal at day Nr. ' + dayIndex + ' as ' + usedAs + '.');
            this.snackBar.open('Mahlzeit wurde nicht hinzugefügt! Platz bereits besetzt!', 'Schliessen', {duration: 4000});
            return;
          }

          console.log('Create meal at day Nr. ' + dayIndex + ' as ' + usedAs + '.');

          // add campId to usedInCamps
          if (!meal.usedInCamps.includes(this.camp.documentId)) {
            meal.usedInCamps.push(this.camp.documentId);
            await this.dbService.updateDocument(meal);
          }

          console.log('Add campID');

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

          this.updateAccess(meal);

          console.log('After Update Meal');

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

    // shown delete Meassage
    const snackBar = this.snackBar.open('Mahlzeit wurde entfehrnt.', 'Rückgängig', {duration: 4000});

    // Löscht das Rezept oder breicht den Vorgang ab, je nach Aktion der snackBar...
    let canDelete = true;
    snackBar.onAction().subscribe(() => {
      canDelete = false;
      document.querySelector('[data-meal-id=ID-' + elementID + ']')?.classList.toggle('hidden');

    });
    snackBar.afterDismissed().subscribe(() => {

      if (canDelete) {
        this.dbService.deleteSpecificMealAndRecipes(mealId, elementID);
        return;
      }

    });

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

  /**
   * Berechnet die Anzhal Tage pro Zeile gemäss der Bildschirmbreite
   *
   */
  private calculateCols() {

    return Math.floor(document.body.scrollWidth / 340);
  }

  private updateAccess(meal: Meal) {

    try {

      // request for update rights for meals, recipes and specificMeals and specificRecipes
      this.dbService.refreshAccessData(this.camp.documentId, meal.path)
        .subscribe(console.log, error => console.log(error));

    } catch (err) {
      console.log(err);
    }

  }
}
