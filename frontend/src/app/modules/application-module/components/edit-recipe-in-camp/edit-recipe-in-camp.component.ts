import {Component, EventEmitter, Input, OnChanges, OnInit, Output} from '@angular/core';
import {UntypedFormBuilder} from '@angular/forms';
import {firstValueFrom, Observable} from 'rxjs';
import {mergeMap, take} from 'rxjs/operators';
import {Camp} from '../../classes/camp';
import {Meal} from '../../classes/meal';
import {Recipe} from '../../classes/recipe';
import {SpecificMeal} from '../../classes/specific-meal';
import {SpecificRecipe} from '../../classes/specific-recipe';
import {RecipeInfoComponent} from '../../dialoges/recipe-info/recipe-info.component';
import {AutoSaveService, Saveable} from '../../services/auto-save.service';
import {DatabaseService} from '../../services/database.service';
import {SettingsService} from '../../services/settings.service';
import {MatDialog} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';
import {HeaderNavComponent} from "../../../../shared/components/header-nav/header-nav.component";


@Component({
  standalone: false,
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
    private formBuilder: UntypedFormBuilder,
    private databaseService: DatabaseService,
    public dialog: MatDialog,
    public snackBar: MatSnackBar,
    private autosave: AutoSaveService) {
  }

  public newUnsavedChanges() {

    this.recipeChanged = true;
    this.autosave.newUnsavedChanges();

  }

  public hasUnsavedChanges() {

    return this.recipeChanged;

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

      document.getElementById(this.recipe.documentId).classList.add('hidden');

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


    if (!this.recipeChanged) {
      return false;
    }

    // changes made while the recipe gets written have to be saved again
    this.recipeChanged = false;

    try {
      const specificRecipe = await firstValueFrom(this.specificRecipe);
      this.calcPart(specificRecipe);
      await this.saveRecipe(specificRecipe);
    } catch (error) {
      this.recipeChanged = true;
      throw error;
    }

    return true;

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

    await this.databaseService.saveDocument(this.recipe);
    await this.databaseService.updateDocument(specificRecipe);

    // The overwritings stay in the recipe, as the user keeps working with it after an automatic save.
    for (const writer of this.recipe.getOverwriters()) {
      const ingredients = this.recipe.getOverwritingIngredients(writer);
      await this.databaseService.saveOverwrites(ingredients, this.recipe.documentId, writer);
    }

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
        this.camp.leaders,
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
