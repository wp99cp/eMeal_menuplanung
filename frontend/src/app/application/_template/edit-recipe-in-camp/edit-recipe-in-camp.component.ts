import {Component, EventEmitter, Input, OnChanges, OnInit, Output} from '@angular/core';
import {FormBuilder} from '@angular/forms';
import {Observable} from 'rxjs';
import {mergeMap, take} from 'rxjs/operators';
import {HeaderNavComponent} from 'src/app/_template/header-nav/header-nav.component';
import {Camp} from '../../_class/camp';
import {Meal} from '../../_class/meal';
import {Recipe} from '../../_class/recipe';
import {SpecificMeal} from '../../_class/specific-meal';
import {SpecificRecipe} from '../../_class/specific-recipe';
import {RecipeInfoComponent} from '../../_dialoges/recipe-info/recipe-info.component';
import {Saveable} from '../../_service/auto-save.service';
import {DatabaseService} from '../../_service/database.service';
import {SettingsService} from '../../_service/settings.service';
import {MatDialog} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';


@Component({
  selector: 'app-edit-recipe-in-camp',
  templateUrl: './edit-recipe-in-camp.component.html',
  styleUrls: ['./edit-recipe-in-camp.component.sass']
})

export class EditRecipeInCampComponent implements OnInit, Saveable, OnChanges {

  //  fields given by the parent element
  @Input() public camp: Camp;
  @Input() public meal: Meal;
  @Input() public specificMeal: SpecificMeal;
  @Input() public recipe: Recipe;
  @Input() index: number;
  @Input() isOpen: boolean;
  @Input() showOverwrites: boolean;

  @Output() opened = new EventEmitter<number>();
  @Output() saveOthers = new EventEmitter<boolean>();

  public specificRecipe: Observable<SpecificRecipe>;
  public mealPart: number;

  private recipeChanged = false;

  constructor(
    private formBuilder: FormBuilder,
    private databaseService: DatabaseService,
    public dialog: MatDialog,
    public snackBar: MatSnackBar) {
  }

  public newUnsavedChanges() {

    this.recipeChanged = true;

  }

  ngOnInit() {

    // Ladet das spezifische Rezept.
    this.specificRecipe = this.databaseService.getSpecificRecipe(this.specificMeal.documentId, this.meal.documentId, this.recipe, this.camp).pipe(take(1));
    this.specificRecipe.subscribe(specificRecipe => this.calcPart(specificRecipe));

    // lade overwrites
    this.databaseService.loadRecipeOverwrites(this.recipe.documentId, this.camp.documentId).subscribe(doc => {

        if (doc.data()) {
          const ings = (doc.data() as any).ingredients;
          this.recipe.overwriteIngredients(ings, this.camp.documentId);
        }

      },

      // No overwrites for this document
      error => {
      });

  }


  /**
   * this recipe was opened
   */
  onExpand() {
    this.opened.emit(this.index);

    // set Timeout: sowohl zu optischen Zwecken als auch
    // damit beim Wechsel zwischen Rezepten das Menu nicht verschwindet
    setTimeout(() => {

      HeaderNavComponent.remove('Rezept Info');
      HeaderNavComponent.remove('Rezept');

      HeaderNavComponent.addToHeaderNav({
        active: true,
        description: 'Informationen zum Rezept',
        name: 'Rezept Info',
        action: (() => this.openRecipeInfo()),
        icon: 'info'
      });
      HeaderNavComponent.addToHeaderNav({
        active: true,
        description: 'Rezept löschen',
        name: 'Rezept',
        action: (() => this.deleteRecipe()),
        icon: 'delete'
      });

    }, 150);
  }

  /**
   * this recipe was closed
   */
  onClose() {

    this.opened.emit(-1);
    HeaderNavComponent.remove('Rezept Info');
    HeaderNavComponent.remove('Rezept');

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
   * Löscht ein Rezept.
   *
   * Um Datenverlust zu vermeiden, werden zu erst alle offenen Änderungen
   * der anderen Rezepte gespeichert.
   *
   */
  public deleteRecipe() {

    this.saveOthers.emit(true);

    this.specificRecipe.subscribe(specificRecipe => {

      document.getElementById(specificRecipe.documentId).classList.add('hidden');

      const snackBar = this.snackBar.open('Rezept wurde entfernt.', 'Rückgängig', {duration: 4000});

      let canDelete = true;
      snackBar.onAction().subscribe(() => {
        canDelete = false;
        document.getElementById(specificRecipe.documentId).classList.toggle('hidden');

      });
      snackBar.afterDismissed().subscribe(() => {

        if (canDelete) {
          this.databaseService.removeRecipe(this.meal.documentId, this.recipe.documentId);
        }

      });

    });

  }

  public async save(): Promise<boolean> {


    return new Promise((resolve) => {


      this.specificRecipe.subscribe(specificRecipe => {


        this.calcPart(specificRecipe);

        if (this.recipeChanged) {
          console.log('Autosave Recipe');
          this.saveRecipe(specificRecipe);
          resolve(true);
        }
        resolve(false);

      });
    });

  }

  /**
   *
   * Speichert das Rezept ab!
   *
   * @param specificRecipe id of the specific Recipe
   */
  async saveRecipe(specificRecipe: SpecificRecipe) {

    // Remove trivial overwritings
    this.recipe.checkForTrivials();

    await this.databaseService.updateDocument(this.recipe);
    await this.databaseService.updateDocument(specificRecipe);

    let infiniteLoopCounter = 0;

    while (this.recipe.getCurrentWriter() !== this.recipe.documentId) {

      if (infiniteLoopCounter > 25) {
        throw new Error('Prevent execution of an infinite Loop! Recipe can\'t be saved');
      }

      const writer = this.recipe.getCurrentWriter();

      const ingredients = this.recipe.removeOverwritingIngredients(writer);
      await this.databaseService.saveOverwrites(ingredients, this.recipe.documentId, writer);

      infiniteLoopCounter++;

    }

    this.recipeChanged = false;

  }


  /**
   * Stellt die Beschreibung für die Anzahl Teilnehmende eines Rezeptes zusammen.
   * inkl. Anzeige Vegi oder nicht usw.
   *
   */
  public getPanelDescriptionParticipants(specificRecipe: SpecificRecipe) {


    if (specificRecipe !== undefined && specificRecipe !== null) {

      this.calcPart(specificRecipe);

      switch (specificRecipe.vegi) {

        case 'non-vegetarians':
          return 'nur für Nicht-Vegis (' + this.mealPart + ' P.)';
        case 'vegetarians':
          return 'nur für Vegis (' + this.mealPart + ' P.)';
        case 'leaders':
          return 'nur für Leiter (' + this.mealPart + ' P.)';
        default:
          return 'für ' + this.mealPart + ' Personen';

      }

    }

  }

  ngOnChanges() {

    this.recipe.showOverwrites(this.showOverwrites);

  }

  private calcPart(specificRecipe: SpecificRecipe) {

    if (specificRecipe !== undefined && specificRecipe !== null) {
      this.mealPart = SettingsService.calcRecipeParticipants(
        this.camp.participants,
        this.camp.vegetarians,
        this.specificMeal.participants,
        specificRecipe.participants,
        this.specificMeal.overrideParticipants,
        specificRecipe.overrideParticipants,
        specificRecipe.vegi);
    }

  }

  /**
   *
   */
  private openRecipeInfo() {

    this.specificRecipe.pipe(take(1)).pipe(mergeMap(specificRecipe =>

        this.dialog.open(RecipeInfoComponent, {
          height: '618px',
          width: '1000px',
          data: {camp: this.camp, specificMeal: this.specificMeal, recipe: this.recipe, specificRecipe}
        }).afterClosed()

      // This second take(1) is necessary, since otherwise there is a bug... where you can't save the usergroup
      // after adding a new recipe without reloading the page inbetween
    )).pipe(take(1)).subscribe(async ([recipe, specificRecipe]: [Recipe, SpecificRecipe]) => {


      // Save results
      await Promise.all([
        this.databaseService.updateDocument(recipe),
        this.databaseService.updateDocument(specificRecipe)]).catch(err => console.log('ERR: ' + err));

    });

  }


}
