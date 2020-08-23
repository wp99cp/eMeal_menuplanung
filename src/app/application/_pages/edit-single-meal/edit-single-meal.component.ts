import {Component, OnInit, QueryList, ViewChildren} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {empty, Observable} from 'rxjs';
import {map, mergeMap, shareReplay, switchMap, take, tap} from 'rxjs/operators';
import {HeaderNavComponent} from 'src/app/_template/header-nav/header-nav.component';
import {Meal} from '../../_class/meal';
import {Recipe} from '../../_class/recipe';
import {MealInfoComponent} from '../../_dialoges/meal-info/meal-info.component';
import {AutoSaveService} from '../../_service/auto-save.service';
import {DatabaseService} from '../../_service/database.service';
import {EditRecipeInCampComponent} from '../../_template/edit-recipe-in-camp/edit-recipe-in-camp.component';
import {SwissDateAdapter} from 'src/app/utils/format-datapicker';
import {MatDialog} from '@angular/material/dialog';
import {ShareDialogComponent} from '../../_dialoges/share-dialog/share-dialog.component';
import {HelpService} from '../../_service/help.service';

@Component({
  selector: 'app-edit-single-meal',
  templateUrl: './edit-single-meal.component.html',
  styleUrls: ['./edit-single-meal.component.sass']
})
export class EditSingleMealComponent implements OnInit {

  public meal: Observable<Meal>;
  public recipes: Observable<Recipe[]>;
  public indexOfOpenedPanel = -1;

  @ViewChildren(EditRecipeInCampComponent) editRecipes: QueryList<EditRecipeInCampComponent>;

  private urlPathData: Observable<string[]>;
  private unsavedChanges: { [id: string]: Recipe } = {};

  constructor(
    private route: ActivatedRoute,
    public dbService: DatabaseService,
    public dialog: MatDialog,
    private router: Router,
    public swissDateAdapter: SwissDateAdapter,
    private helpService: HelpService,
    private autosave: AutoSaveService) {

    autosave.register(this);


    helpService.addHelpMessage({
      title: 'Mahlzeiten freigeben und gemeinsam bearbeiten.',
      message: `Mahlzeiten können mit anderen Nutzern von eMeal-Menüplanung geteilt werden.
                Dabei kannst du eine Mahlzeit mit den folgenden Berechtigungen teilen. Dabei erben die hinzugefügten Rezepte die Berechtigungen der Mahlzeit.<br>
                <ul>
                    <li><b>Besitzer:</b> Diese Rolle hat derjenige, der die Mahlzeit erstellt hat. Der Besitzer hat
                    uneingeschränkten Zugriff auf die Mahlzeit.</li>
                    <li><b>Administrator:</b> Kann die Mahlzeit bearbeiten (Zutaten ändern, hinzufügen oder löschen) und
                     es in eigenen Lagern verwenden. Kann die Mahlzeit mit andern teilen, nicht aber löschen.</li>
                     <li><b>Leser:</b> Kann die Mahlzeit und die Rezepte betrachten. Kann eine eigene Kopie erstellen
                     und diese anschliessend bearbeiten.</li>
                </ul>
                <br>
                <img width="100%" src="/assets/img/help_info_messages/Share_Recipe.png">`,
      url: router.url,
      ref: 'recipe-authorization-infos'
    });

  }

  /**
   * returns the url segment based on a search of the parent directory.
   *
   * @param parentDirectory name of the parent directory
   * @param offset form the parent directory
   */
  loadIDFromURL(parentDirectory: string, offset = 1) {
    return (source: Observable<string[]>): Observable<string | undefined> => {
      return source.pipe(map(segments =>
        segments.includes(parentDirectory) && segments.length > segments.indexOf(parentDirectory) + offset ?
          segments[segments.indexOf(parentDirectory) + offset] : undefined));
    };
  }

  public newOpened(index: number) {

    this.indexOfOpenedPanel = index;

  }

  ngOnInit() {

    // load id's form the URL
    this.urlPathData = this.route.url.pipe(
      map(urlSegments => urlSegments.map(segment => segment.path)),
      tap(data => console.log(data)), // print on console
      shareReplay() // use the same data for all subscribers
    );


    this.meal = this.urlPathData.pipe(this.loadIDFromURL('meals'),
      switchMap(id => id !== undefined ? this.dbService.getMealById(id) : empty())
    );

    this.meal.subscribe(async meal => {
      if (await this.dbService.canWrite(meal)) {
        HeaderNavComponent.turnOn('Teilen');
      } else {
        HeaderNavComponent.turnOff('Teilen');
      }
    });


    this.recipes = this.urlPathData.pipe(
      this.loadIDFromURL('meals'),
      mergeMap(mealId => this.dbService.getRecipes(mealId))
    );


    HeaderNavComponent.addToHeaderNav({
      active: false,
      description: 'Änderungen speichern',
      name: 'Speichern',
      action: (() => this.saveButton()),
      icon: 'save',
    });

    HeaderNavComponent.addToHeaderNav({
      active: false,
      description: 'Informationen zur Mahlzeit',
      name: 'Mahlzeit',
      action: (() => this.mealInfoDialog()),
      icon: 'info',
    });

    HeaderNavComponent.addToHeaderNav({
      active: false,
      description: 'Mahlzeit freigeben',
      name: 'Teilen',
      action: (() => this.share()),
      icon: 'share',
      separatorAfter: true
    });

    HeaderNavComponent.addToHeaderNav({
      active: false,
      description: 'Wähle zuerst ein Rezept',
      name: 'Rezept Info',
      action: (() => null),
      icon: 'info'
    });

    HeaderNavComponent.addToHeaderNav({
      active: false,
      description: 'Wähle zuerst ein Rezept',
      name: 'Rezept',
      action: (() => null),
      icon: 'delete'
    });


  }


  /**
   * Öffnet den Dialog zu den Informationen der Mahlzeit.
   *
   */
  public mealInfoDialog() {

    this.meal.pipe(take(1)).pipe(mergeMap(meal =>

      // Dialog öffnen
      this.dialog.open(MealInfoComponent, {
        height: '618px',
        width: '1000px',
        data: {meal}
      }).afterClosed()
    )).subscribe((resp: Meal) => {

      // Speichern der geänderten Daten im Dialog-Fenster
      this.dbService.updateDocument(resp);

    });

  }


  public async saveMeal() {

    // update meal
    const mealSubs = this.meal.subscribe(meal => {


      this.dbService.updateDocument(meal);

      // reset: deactivate save button
      mealSubs.unsubscribe();

    });

  }

  save(): Promise<boolean> {

    HeaderNavComponent.turnOff('Speichern');

    return new Promise<boolean>(async resolve => {

      if (Object.keys(this.unsavedChanges).length > 0) {

        for (const rec of Object.values(this.unsavedChanges)) {
          await this.dbService.updateDocument(rec);
        }
        resolve(true);

      }

      resolve(false);

    });

  }

  newUnsavedChanges(recipe: Recipe) {

    HeaderNavComponent.turnOn('Speichern');
    this.unsavedChanges[recipe.documentId] = recipe;

  }

  newRecipe() {

  }

  private saveButton() {

    HeaderNavComponent.turnOff('Speichern');
    this.save();

  }


  private share() {


    this.meal.pipe(
      take(1),
      mergeMap(meal =>
        this.dialog.open(ShareDialogComponent, {
          height: '618px',
          width: '1000px',
          data: {
            objectName: 'Mahlzeit',
            currentAccess: meal.getAccessData(),
            documentPath: meal.path,
            /*
              TODO: Dies führt zu einer Sicherheitslücke! Falls der owner in dieser Liste steht, so kann ein Nutzer ohne
               owner-Berechtigung einen anderen Benutzer zum Onwer erklären. DIes muss über eine Security-Rule gelöst werden!
             */
            accessLevels: ['editor', 'viewer']
          }
        }).afterClosed()))
      .subscribe((accessData) => {

        // Add Berechtigung für Rezepte

        // TODO: in Cloud-Function!!!!

        this.recipes.pipe(take(1)).subscribe(recipes =>
          recipes.forEach(recipe => {

            console.log(accessData)

            recipe.setAccessData(accessData);
            this.dbService.updateDocument(recipe)

          })
        );

      });

  }


}
