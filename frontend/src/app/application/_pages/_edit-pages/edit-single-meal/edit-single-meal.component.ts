import {Component, OnInit, QueryList, ViewChildren} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {empty, Observable} from 'rxjs';
import {map, mergeMap, shareReplay, switchMap, take, tap} from 'rxjs/operators';
import {HeaderNavComponent} from 'src/app/_template/header-nav/header-nav.component';
import {Meal} from '../../../_class/meal';
import {Recipe} from '../../../_class/recipe';
import {AutoSaveService} from '../../../_service/auto-save.service';
import {DatabaseService} from '../../../_service/database.service';
import {EditRecipeInCampComponent} from '../../../_template/edit-recipe-in-camp/edit-recipe-in-camp.component';
import {SwissDateAdapter} from 'src/app/utils/format-datapicker';
import {MatDialog} from '@angular/material/dialog';
import {ShareDialogComponent} from '../../../_dialoges/share-dialog/share-dialog.component';
import {SettingsService} from '../../../_service/settings.service';
import {MealInfoWithoutCampComponent} from '../../../_dialoges/meal-info-without-camp/meal-info-without-camp.component';

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
    private autosave: AutoSaveService,
    public settingsService: SettingsService) {

    autosave.register(this);

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
      active: true,
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
      this.dialog.open(MealInfoWithoutCampComponent, {
        height: '618px',
        width: '1000px',
        data: {meal}
      }).afterClosed()
    )).subscribe((meal: Meal) => {

      if (meal === undefined) {
        return;
      }

      // Speichern der geänderten Daten im Dialog-Fenster
      this.dbService.updateDocument(meal);

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
            helpMessageId: 'camp-authorization-infos',
            currentAccess: meal.getAccessData(),
            documentPath: meal.path,
            accessLevels: ['editor', 'viewer']
          }
        }).afterClosed())).subscribe();

  }


}
