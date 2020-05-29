import {SelectionModel} from '@angular/cdk/collections';
import {CdkDragDrop, moveItemInArray, transferArrayItem} from '@angular/cdk/drag-drop';
import {Component, Input, OnChanges, OnInit} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {firestore} from 'firebase/app';
import {merge, Observable, of} from 'rxjs';
import {mergeMap, take} from 'rxjs/operators';
import {HeaderNavComponent} from 'src/app/_template/header-nav/header-nav.component';
import {Camp} from '../../_class/camp';
import {Day} from '../../_class/day';
import {Meal} from '../../_class/meal';
import {SpecificMeal} from '../../_class/specific-meal';
import {AddMealComponent} from '../../_dialoges/add-meal/add-meal.component';
import {Saveable} from '../../_service/auto-save.service';
import {DatabaseService} from '../../_service/database.service';
import {MatSnackBar} from '@angular/material/snack-bar';


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

  // TODO: add short-cut for adding meal (shift + M)
  // TODO: add short-cut for adding day (shift + D)

  // inputed fields
  @Input() camp: Camp;

  public colCounter = this.calculateCols();
  public showParticipantsWarning = false;
  public specificMealsToSave: SpecificMeal[] = [];

  public hasAccess: boolean = false;

  constructor(
    public dialog: MatDialog,
    public dbService: DatabaseService,
    public snackBar: MatSnackBar) {

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

  }


  /**
   * updates the participantsWarning
   *
   */
  ngOnChanges() {

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

    // Prüft, ob etwas gespeichert werden muss
    if (this.specificMealsToSave.length > 0) {

      HeaderNavComponent.turnOff('Speichern');

      // Speichert die Mahlzeiten
      this.saveMeals();
      this.snackBar.open('Änderungen wurden erfolgreich gespeichert!', '', { duration: 2000 });

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
  public drop([specificMeal, event]: [SpecificMeal, CdkDragDrop<any, any>]) {

    if (!this.hasAccess)
      return;

    // aktiviert das Speichern
    HeaderNavComponent.turnOn('Speichern');

    // updatet das Datum
    specificMeal.date = firestore.Timestamp.fromMillis(Number.parseInt(event.container.id, 10));

    // prüft das Vorbereitsungsdatum
    if (specificMeal.prepareAsDate.getTime() >= specificMeal.date.toDate().getTime() && specificMeal.prepare) {

      // Vorbereitungsdatum nach oder am Tag der Mahlzeit...
      specificMeal.prepare = false;
      this.snackBar.open('Vorbereitung der Mahlzeit wurde deaktiviert!', '', { duration: 2000 });

    }

    // markiert die Mahlzeit als geändert
    if (this.specificMealsToSave.indexOf(specificMeal) === -1) {

      this.specificMealsToSave.push(specificMeal);

    }


    // Updatet das GUI: verschiebt das Lager in den neuen Container
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

    this.specificMealsToSave.forEach(meal =>
      this.dbService.updateDocument(meal));

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


    // Testversuch für die Sortierung der Mahlzeiten
    const mealsOb: Observable<SpecificMeal[]>[] = [];
    this.camp.days.forEach(day => mealsOb.push(day.getMeals()));
    merge(...mealsOb).pipe(take(1)).pipe(mergeMap((meal: SpecificMeal[]) => {

      const mealNames = [];
      meal.forEach(m => mealNames.push(m.weekTitle));

      this.save();

      return this.dialog.open(AddMealComponent, {
        height: '618px',
        width: '1000px',
        data: { mealNames }
      }).afterClosed();


    })).subscribe((result: SelectionModel<Meal>) => {

      if (result != null) {

        result.selected.forEach(async meal => {

          // falls keine Verwendung gestzt, dann als 'Zmorgen'
          const usedAs = meal.usedAs ? meal.usedAs : 'Zmorgen';

          // add campId to usedInCamps
          if (!meal.usedInCamps.includes(this.camp.documentId)) {
            meal.usedInCamps.push(this.camp.documentId);
            this.dbService.updateDocument(meal);
          }

          /*
           * TODO: Berechtigungen sind heikel, daher soll diese Funktion in Zukunft
           * in einer Cloud-Function geregelt werden. Der Client darf und soll nichts
           * mehr an der Berechtigungen verändern dürfen.
           *
           * Grundsätzlich gilt:
           * Der aktuelle Nutzer hat auf das hinzugefügte Rezept mind. Administrator Rechte,
           * ansonsten kann er es gar nicht erst zum Lager hinzufügen.
           *
           * Für ein Administrator und für den Owner der Mahlzeit gilt: Fügt er eine Mahlzeit hinzu
           * so bleibt seine eigene Rolle unverändert, d.h. hat er die Inhaberschaft (owner) der
           * Mahlzeit, so behält er diese; hat er nur Administratorrechte ist aber der Besitzer
           * des Lagers so ändern sich seine Rechte an der Mahlzeit nicht.
           *
           * Für die anderen Nutzer des Lagers gilt:
           * Alle Nutzer erhalten automatisch max. Mitarbeiter (collaborator) Berechtigung.
           * D.h. sie können die Mahlzeit nur in diesem Lager bearbeiten. Nicht aber die globale
           * Vorlage für die anderen Lagern. Hat ein Nutzer bereits höhere Rechte für die hinzu-
           * gefügte Mahlzeit, so bleiben diese natürlich erhalten.
           * Ein Leser (viewer) erhält ebenfalls Leseberechtigung für die Mahlzeit.
           *
           * Die Rechte können für die einzelnen Mahlzeiten beliebig erhöht werden. Bzw. bis maximal
           * zum Leser abgestuft werden.
           *
           *
           * Analog werden die Rechte für die Rezepte vergeben.
           *
           *
           * Achtung: Collaborator Rollen werden auf Viewer Rollen abgestuft, sobald eine Mahlzeit oder
           * ein Rezept aus dem Lager gelöscht wird. Viewer Rollen können (zur Zeit noch nicht) manuell
           * wieder entfehrnt weren, sofern das Rezept oder die Mahlzeit niergens sonst Benutzt wird, wo
           * Lesezugriff vergeben wurde.
           *
           */


          // TODO: Implementation
          this.dbService.upgradeAccessData(this.camp.getAccessData(), meal.getAccessData(), meal.path);
          this.dbService.getRecipes(meal.documentId).subscribe(recipes => recipes.forEach(
            recipe => this.dbService.upgradeAccessData(this.camp.getAccessData(), recipe.getAccessData(), recipe.path)
          ));

          // erstellt die specifischen Rezepte und Mahlzeiten
          const specificMealId = await meal.createSpecificMeal(this.dbService, this.camp, this.camp.days[dayIndex], usedAs);
          meal.createSpecificRecipes(this.dbService, this.camp, specificMealId);

        });

      }

    });

  }


  /**
   * Löscht die ausgewählt Mahlzeit.
   *
   */
  public deleteMeal(mealId: string, specificMealId: string) {

    // versteckt das Element aus dem GUi
    document.getElementById(specificMealId).classList.add('hidden');

    // shown delete Meassage
    const snackBar = this.snackBar.open('Mahlzeit wurde entfehrnt.', 'Rückgängig', { duration: 4000 });

    // Löscht das Rezept oder breicht den Vorgang ab, je nach Aktion der snackBar...
    let canDelete = true;
    snackBar.onAction().subscribe(() => {
      canDelete = false;
      document.getElementById(specificMealId).classList.toggle('hidden');

    });
    snackBar.afterDismissed().subscribe(() => {

      if (canDelete) {
        this.dbService.deleteSpecificMealAndRecipes(mealId, specificMealId);
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

  /**
   * Berechnet die Anzhal Tage pro Zeile gemäss der Bildschirmbreite
   *
   */
  private calculateCols() {

    return Math.floor(document.body.scrollWidth / 340);
  }


}
