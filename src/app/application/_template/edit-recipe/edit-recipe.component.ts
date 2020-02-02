import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output, OnChanges } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog, MatSnackBar } from '@angular/material';
import { MatTableDataSource } from '@angular/material/table';
import { HeaderNavComponent } from 'src/app/_template/header-nav/header-nav.component';

import { Camp } from '../../_class/camp';
import { Meal } from '../../_class/meal';
import { Recipe } from '../../_class/recipe';
import { SpecificMeal } from '../../_class/specific-meal';
import { SpecificRecipe } from '../../_class/specific-recipe';
import { RecipeInfoComponent } from '../../_dialoges/recipe-info/recipe-info.component';
import { Ingredient } from '../../_interfaces/ingredient';
import { Saveable } from '../../_service/auto-save.service';
import { DatabaseService } from '../../_service/database.service';
import { of } from 'rxjs';
import { SettingsService } from '../../_service/settings.service';

@Component({
  selector: 'app-edit-recipe',
  templateUrl: './edit-recipe.component.html',
  styleUrls: ['./edit-recipe.component.sass']
})

// TODO: überschreiben von MasterDocument (Recipe) mit Daten (vorallem bei den Zutaten),.
// die im specificrecipe gespeichert werden... Überschreibungen farbig markieren.
// toggle zwischen den Modi: dieses Rezept bearbeiten || Vorlage bearbeiten
//
export class EditRecipeComponent implements OnInit, Saveable, AfterViewInit, OnChanges {


  public recipeForm: FormGroup;
  public displayedColumns: string[] = ['measure', 'calcMeasure', 'unit', 'food', 'comment', 'delete'];
  public dataSource: MatTableDataSource<Ingredient>;

  private ingredientFieldNodes: Element[];
  private keyListnerEnter: EventListenerOrEventListenerObject;

  //  fields given by the parent element
  @Input() meal: Meal;
  @Input() public specificMeal: SpecificMeal;
  @Input() recipe: Recipe;
  @Input() public specificRecipe: SpecificRecipe;
  @Input() public camp: Camp;
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

    this.recipeForm = this.formBuilder.group({
      notes: this.recipe.notes,
    });

    this.ingredientFieldNodes = this.getNodes();

    this.calcPart();

  }

  ngOnChanges() {

    // reactivates the save button
    setTimeout(() => {

      this.ingredientFieldNodes = this.getNodes();
      this.setFocusChanges();

    }, 500);

  }

  private calcPart() {

    this.mealPart = SettingsService.calcRecipeParticipants(
      this.camp.participants,
      this.camp.vegetarier,
      this.specificMeal.participants,
      this.specificRecipe.participants,
      this.specificMeal.overrideParticipants,
      this.specificRecipe.overrideParticipants,
      this.specificRecipe.vegi);

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

  private openRecipeInfo() {

    this.dialog.open(RecipeInfoComponent, {
      height: '618px',
      width: '1000px',
      data: { camp: this.camp, specificMeal: this.specificMeal, recipe: this.recipe, specificRecipe: this.specificRecipe }
    }).afterClosed().subscribe(([recipe, specificRecipe]: [Recipe, SpecificRecipe]) => {

      this.databaseService.updateDocument(recipe.extractDataToJSON(), recipe.getDocPath());
      this.databaseService.updateDocument(specificRecipe.extractDataToJSON(), specificRecipe.getDocPath());

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


    document.getElementById(this.specificRecipe.firestoreElementId).classList.add('hidden');

    const snackBar = this.snackBar.open('Rezept wurde entfehrnt.', 'Rückgängig', { duration: 4000 });

    let canDelete = true;
    snackBar.onAction().subscribe(() => {
      canDelete = false;
      document.getElementById(this.specificRecipe.firestoreElementId).classList.toggle('hidden');

    });
    snackBar.afterDismissed().subscribe(() => {

      if (canDelete) {
        this.databaseService.removeRecipe(this.meal.firestoreElementId, this.recipe.firestoreElementId);
      }

    });



  }


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



  // save on destroy
  public async save(): Promise<boolean> {

    this.calcPart();

    if (this.recipeForm.touched) {
      console.log('Autosave Recipe');
      await this.saveRecipe();
      return true;
    }

    return false;

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

  }

  /**
   * Fügt ein leeres Ingredient-Field am Ende der Tabelle hinzu.
   */
  addIngredientField() {

    // generiert leere Daten für ein neues Ingredient
    this.dataSource.data[this.dataSource.data.length] = { food: '', unit: '', measure: null, comment: '' };
    this.dataSource._updateChangeSubscription();
    this.recipeForm.markAsTouched();

    // set focus to new Element
    this.setFocusChanges();
    this.ingredientFieldNodes = this.getNodes();
    (this.ingredientFieldNodes[this.ingredientFieldNodes.length - 5] as HTMLElement).focus();

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
        comment: ''
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
  public getPanelDescriptionParticipants() {

    this.calcPart();

    switch (this.specificRecipe.vegi) {

      case 'nonVegi': return 'nur für Nicht-Vegis (' + this.mealPart + ' P.)';
      case 'vegiOnly': return 'nur für Vegis (' + this.mealPart + ' P.)';
      default: return 'für ' + this.mealPart + ' Personen';


    }

  }

  async saveRecipe() {

    this.recipe.notes = this.recipeForm.value.notes;


    this.databaseService.updateDocument(this.recipe.extractDataToJSON(), this.recipe.getDocPath());
    this.databaseService.updateDocument(this.specificRecipe.extractDataToJSON(), this.specificRecipe.getDocPath());

    // reset: deactivate save button
    this.recipeForm.markAsUntouched();

  }

}
