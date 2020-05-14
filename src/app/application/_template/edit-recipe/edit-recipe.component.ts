import {AfterViewInit, Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output} from '@angular/core';
import {Recipe} from '../../_class/recipe';
import {FormBuilder, FormGroup} from '@angular/forms';
import {MatTableDataSource} from '@angular/material/table';
import {Ingredient} from '../../_interfaces/firestoreDatatypes';
import {HeaderNavComponent} from '../../../_template/header-nav/header-nav.component';
import {DatabaseService} from '../../_service/database.service';

@Component({
  selector: 'app-edit-recipe',
  templateUrl: './edit-recipe.component.html',
  styleUrls: ['./edit-recipe.component.sass']
})
export class EditRecipeComponent implements OnInit, AfterViewInit, OnChanges {

  public displayedColumns: string[] = ['measure', 'calcMeasure', 'unit', 'food', 'comment', 'fresh-product', 'delete'];

  public recipeForm: FormGroup;
  public dataSource: MatTableDataSource<Ingredient>;

  @Input() public recipe: Recipe;
  @Input() public participants: number;
  @Output() newUnsavedChanges = new EventEmitter();

  private keyListenerEnter: EventListenerOrEventListenerObject;
  private ingredientFieldNodes: Element[];

  constructor(
    private formBuilder: FormBuilder,
    private databaseService: DatabaseService,
    private hostElement: ElementRef) {
  }

  ngOnInit(): void {

    this.ingredientFieldNodes = this.getNodes();

    this.dataSource = new MatTableDataSource<Ingredient>(this.recipe.ingredients);
    this.recipeForm = this.formBuilder.group({notes: this.recipe.notes});

    this.recipeForm.statusChanges.subscribe(() => {
      this.newUnsavedChanges.emit();
      HeaderNavComponent.turnOn('Speichern');
      this.recipe.notes = this.recipeForm.value.notes;
    });

  }

  ngOnChanges() {

    if (this.participants <= 1) {
      this.displayedColumns = this.displayedColumns.filter(el => el !== 'calcMeasure');
    } else {
      this.displayedColumns.splice(1, 0, 'calcMeasure');

    }

    // reactivates the save button
    setTimeout(() => {

      this.ingredientFieldNodes = this.getNodes();
      this.setFocusChanges();

    }, 500);

  }


  ngAfterViewInit() {

    this.setFocusChanges();

  }


  public toggleFresh(ingredient: Ingredient) {

    ingredient.fresh = !ingredient.fresh;
    this.recipeForm.markAsTouched();
    this.dataSource._updateChangeSubscription();

    HeaderNavComponent.turnOn('Speichern');
    this.newUnsavedChanges.emit();

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
    this.dataSource.data[this.dataSource.data.length] = {
      food: '',
      unit: '',
      measure: null,
      comment: '',
      fresh: false,
      unique_id: Recipe.createIngredientId(this.recipe.documentId)
    };
    this.dataSource._updateChangeSubscription();
    this.recipeForm.markAsTouched();

    // set focus to new Element
    this.setFocusChanges();
    this.ingredientFieldNodes = this.getNodes();
    (this.ingredientFieldNodes[this.ingredientFieldNodes.length - 5] as HTMLElement).focus();

    HeaderNavComponent.turnOn('Speichern');

  }


  /**
   * Aktion bei einer Veränderung eines Ingredient-Feldes
   */
  changeIngredient(value: string, index: number, element: string) {

    console.log(value);

    // Eingabe von mehreren durch Tabs geteilte Zellen (z.B. Copy-Past aus Excel)
    if (element === 'measure' && value.includes('\t')) {
      this.parseTableInput(index, value);

    } else if (element === 'calcMeasure') {

      // Berechnung für eine Person
      this.recipe.ingredients[index].measure = Number.parseFloat(value) / this.participants;

    } else {

      // übernahme ins Object Recipe
      this.recipe.ingredients[index][element] = value;
    }

    this.newUnsavedChanges.emit();

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

  /**
   * Parst einen Input als Tabelle
   */
  private parseTableInput(index: number, value: string) {

    this.recipe.ingredients.splice(index, 1);

    // Regulärer Ausdruck für das Parsing des Inputs
    const ex = /([0-9]|[.][0-9])+\t([a-z]|[ä]|[ü]|[ö]|[.])+\t([a-z]|[ä]|[ü]|[ö]|[0-9]|[ ](?!([0-9]|[.])+\t))+/gi;

    const ingredientsAsArray = value.match(ex).join().split(',');

    let i = index;

    for (const ing of ingredientsAsArray) {

      const ingredientAsArray = ing.split('\t');

      this.recipe.ingredients.push({
        unique_id: Recipe.createIngredientId(this.recipe.documentId),
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
   *
   */
  private setFocusChanges() {

    // delete old listeners
    for (const node of this.ingredientFieldNodes) {
      node.removeEventListener('keydown', this.keyListenerEnter);
    }

    // add new listeners
    for (let i = 0; i < this.ingredientFieldNodes.length; i++) {
      this.keyListenerEnter = this.keyListner(i);
      this.ingredientFieldNodes[i].addEventListener('keydown', this.keyListenerEnter);
    }

  }

  /**
   * @returns all nodes of an ingredient-field in this recipe-panel
   */
  private getNodes(): any {

    return this.hostElement.nativeElement.getElementsByClassName('ingredient-field');

  }

}
