import { AfterViewInit, Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog, MatSnackBar } from '@angular/material';
import { MatTableDataSource } from '@angular/material/table';
import { Observable } from 'rxjs';
import { take, mergeMap } from 'rxjs/operators';
import { HeaderNavComponent } from 'src/app/_template/header-nav/header-nav.component';

import { Camp } from '../../_class/camp';
import { Meal } from '../../_class/meal';
import { Recipe } from '../../_class/recipe';
import { SpecificMeal } from '../../_class/specific-meal';
import { SpecificRecipe } from '../../_class/specific-recipe';
import { RecipeInfoComponent } from '../../_dialoges/recipe-info/recipe-info.component';
import { Ingredient } from '../../_interfaces/firestoreDatatypes';
import { Saveable } from '../../_service/auto-save.service';
import { DatabaseService } from '../../_service/database.service';
import { SettingsService } from '../../_service/settings.service';

@Component({
  selector: 'app-edit-recipe',
  templateUrl: './edit-recipe.component.html',
  styleUrls: ['./edit-recipe.component.sass']
})

export class EditRecipeComponent implements OnInit, Saveable, AfterViewInit, OnChanges {


  public recipeForm: FormGroup;
  public displayedColumns: string[] = ['measure', 'calcMeasure', 'unit', 'food', 'comment', 'fresh-product', 'delete'];
  public dataSource: MatTableDataSource<Ingredient>;

  private ingredientFieldNodes: Element[];
  private keyListnerEnter: EventListenerOrEventListenerObject;

  //  fields given by the parent element
  @Input() public camp: Camp;

  @Input() public meal: Meal;
  @Input() public specificMeal: SpecificMeal;

  @Input() public recipe: Recipe;
  public specificRecipe: Observable<SpecificRecipe>;

  @Input() index: number;
  @Input() isOpen: boolean;
  @Output() opened = new EventEmitter<number>();
  @Output() saveOthers = new EventEmitter<boolean>();

  public mealPart: number;

  constructor(
    private formBuilder: FormBuilder,
    private databaseService: DatabaseService,
    public dialog: MatDialog,
    public snackBar: MatSnackBar) { }

  ngOnInit() {

    this.dataSource = new MatTableDataSource<Ingredient>(this.recipe.ingredients);
    this.recipeForm = this.formBuilder.group({ notes: this.recipe.notes });

    this.ingredientFieldNodes = this.getNodes();

    // Ladet das specifische Rezept.
    this.specificRecipe = this.databaseService.getSpecificRecipe(this.specificMeal.documentId, this.recipe, this.camp).pipe(take(1));
    this.specificRecipe.subscribe(specificRecipe => this.calcPart(specificRecipe));

  }

  ngOnChanges() {

    // reactivates the save button
    setTimeout(() => {

      this.ingredientFieldNodes = this.getNodes();
      this.setFocusChanges();

    }, 500);

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
   * @returns all nodes of an ingredient-field in this recipe-panel
   */
  private getNodes(): any {


    if (document.getElementsByClassName('mat-expansion-panel')[this.index]) {

      return document.getElementsByClassName('mat-expansion-panel')[this.index].getElementsByClassName('ingredient-field');
    }

    return [];
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
   *
   */
  private openRecipeInfo() {

    this.specificRecipe.pipe(take(1)).pipe(mergeMap(specificRecipe =>

      this.dialog.open(RecipeInfoComponent, {
        height: '618px',
        width: '1000px',
        data: { camp: this.camp, specificMeal: this.specificMeal, recipe: this.recipe, specificRecipe }
      }).afterClosed()

      // This second take(1) is necessary, since otherwise there is a bug... where you can't save the usergroup
      // after adding a new recipe without reloading the page inbetween
    )).pipe(take(1)).subscribe(([recipe, specificRecipe]: [Recipe, SpecificRecipe]) => {

      this.databaseService.updateDocument(recipe);
      this.databaseService.updateDocument(specificRecipe);

    });

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
   *
   */
  ngAfterViewInit() {

    this.setFocusChanges();

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

      const snackBar = this.snackBar.open('Rezept wurde entfehrnt.', 'Rückgängig', { duration: 4000 });

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

  /**
   *
   */
  public toggleFresh(ingredient: Ingredient) {


    ingredient.fresh = !ingredient.fresh;
    this.recipeForm.markAsTouched();
    this.dataSource._updateChangeSubscription();

    HeaderNavComponent.turnOn('Speichern');


  }

  /**
   *
   */
  private setFocusChanges() {

    // delete old listeners
    for (const node of this.ingredientFieldNodes) {
      node.removeEventListener('keydown', this.keyListnerEnter);
    }

    // add new listeners
    for (let i = 0; i < this.ingredientFieldNodes.length; i++) {
      this.keyListnerEnter = this.keyListner(i);
      this.ingredientFieldNodes[i].addEventListener('keydown', this.keyListnerEnter);
    }

  }

  /**
   *
   */
  private keyListner(i: number): EventListenerOrEventListenerObject {

    return (event: any) => {

      HeaderNavComponent.turnOn('Speichern');

      if (event.key === 'Enter') {

        if (i + 1 < this.ingredientFieldNodes.length) {

          const nextFocus = i % 5 === 0 ? i + 2 : i + 1;
          (this.ingredientFieldNodes[nextFocus] as HTMLElement).focus();
        } else {

          this.addIngredientField();
        }
      }
    };
  }


  public async save(): Promise<boolean> {


    return new Promise((resolve) => {


      this.specificRecipe.subscribe(specificRecipe => {


        this.calcPart(specificRecipe);

        if (this.recipeForm.touched) {

          console.log('Autosave Recipe');
          this.saveRecipe(specificRecipe);
          resolve(true);

        }

        resolve(false);

      });
    });

  }


  /**
   * Löscht ein Ingredient aus dem Rezept
   *
   * @param index Index des Ingredient = Zeile in der Tabelle
   */
  deleteIngredient(index: number) {

    this.dataSource.data.splice(index, 1);
    this.dataSource._updateChangeSubscription();
    this.recipeForm.markAsTouched();

    HeaderNavComponent.turnOn('Speichern');

  }

  /**
   * Fügt ein leeres Ingredient-Field am Ende der Tabelle hinzu.
   */
  addIngredientField() {

    // generiert leere Daten für ein neues Ingredient
    this.dataSource.data[this.dataSource.data.length] = { food: '', unit: '', measure: null, comment: '', fresh: false };
    this.dataSource._updateChangeSubscription();
    this.recipeForm.markAsTouched();

    // set focus to new Element
    this.setFocusChanges();
    this.ingredientFieldNodes = this.getNodes();
    (this.ingredientFieldNodes[this.ingredientFieldNodes.length - 5] as HTMLElement).focus();

    HeaderNavComponent.turnOn('Speichern');

  }

  /**
   * Aktion bei einer Veränderung eines Ingreident-Feldes
   */
  changeIngredient(value: string, index: number, element: string) {

    // Eingabe von mehreren durch Tabs geteilte Zellen (z.B. Copy-Past aus Excel)
    if (element === 'measure' && value.includes('\t')) {
      this.parseTableInput(index, value);

    } else if (element === 'calcMeasure') {

      // Berechnung für eine Person
      this.recipe.ingredients[index].measure = Number.parseFloat(value) / this.mealPart;

    } else {

      // übernahme ins Object Recipe
      this.recipe.ingredients[index][element] = value;
    }

    this.recipeForm.markAsTouched();

  }

  /**
   * Parst einen Input als Tabelle
   */
  private parseTableInput(index: number, value: string) {

    this.recipe.ingredients.splice(index, 1);

    // Regulärer Ausdruck für das Parsing des Inputs
    const ex = /([0-9]|[.][0-9])+\t([a-z]|[ä]|[ü]|[ö]|[.])+\t([a-z]|[ä]|[ü]|[ö]|[0-9]|[ ](?!([0-9]|[.]|[0-9])+\t))+/gi;

    const ingredientsAsArray = value.match(ex).join().split(',');

    let i = index;

    for (const ing of ingredientsAsArray) {

      const ingredientAsArray = ing.split('\t');

      this.recipe.ingredients.push({
        food: ingredientAsArray[2],
        unit: ingredientAsArray[1],
        measure: Number.parseFloat(ingredientAsArray[0]),
        comment: '',
        fresh: false,
      });

      i++;
    }

    this.dataSource._updateChangeSubscription();
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

        case 'non-vegetarians': return 'nur für Nicht-Vegis (' + this.mealPart + ' P.)';
        case 'vegetarians': return 'nur für Vegis (' + this.mealPart + ' P.)';
        case 'leaders': return 'nur für Leiter (' + this.mealPart + ' P.)';
        default: return 'für ' + this.mealPart + ' Personen';

      }

    }

  }

  async saveRecipe(specificRecipe: SpecificRecipe) {

    this.recipe.notes = this.recipeForm.value.notes;


    this.databaseService.updateDocument(this.recipe);
    this.databaseService.updateDocument(specificRecipe);

    // reset: deactivate save button
    this.recipeForm.markAsUntouched();

  }

}
