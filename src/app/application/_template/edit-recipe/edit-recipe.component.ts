import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';

import { Camp } from '../../_class/camp';
import { Meal } from '../../_class/meal';
import { Recipe } from '../../_class/recipe';
import { SpecificMeal } from '../../_class/specific-meal';
import { SpecificRecipe } from '../../_class/specific-recipe';
import { Ingredient } from '../../_interfaces/ingredient';
import { Saveable } from '../../_service/auto-save.service';
import { DatabaseService } from '../../_service/database.service';

@Component({
  selector: 'app-edit-recipe',
  templateUrl: './edit-recipe.component.html',
  styleUrls: ['./edit-recipe.component.sass']
})

// TODO: überschreiben von MasterDocument (Recipe) mit Daten (vorallem bei den Zutaten),.
// die im specificrecipe gespeichert werden... Überschreibungen farbig markieren.
// toggle zwischen den Modi: dieses Rezept bearbeiten || Vorlage bearbeiten
//
export class EditRecipeComponent implements OnInit, Saveable, AfterViewInit {

  public recipeForm: FormGroup;
  public displayedColumns: string[] = ['measure', 'calcMeasure', 'unit', 'food', 'delete'];
  public dataSource: MatTableDataSource<Ingredient>;

  private ingredientFieldNodes: Element[];

  //  fields given by the parent element
  @Input() meal: Meal;
  @Input() specificMeal: SpecificMeal;
  @Input() recipe: Recipe;
  @Input() specificRecipe: SpecificRecipe;
  @Input() camp: Camp;
  @Input() index: number;
  @Input() isOpen: boolean;
  @Output() opened = new EventEmitter<number>();

  constructor(private formBuilder: FormBuilder, private databaseService: DatabaseService) { }

  ngOnInit() {

    this.dataSource = new MatTableDataSource<Ingredient>(this.recipe.ingredients);

    this.recipeForm = this.formBuilder.group({
      notes: this.recipe.notes,
      description: this.recipe.description,
      name: this.recipe.name,
      participants: this.specificRecipe.participants,
      overrideParticipants: this.specificRecipe.overrideParticipants,
      vegi: this.specificRecipe.vegi
    });

    this.ingredientFieldNodes = this.getNodes();

  }

  /**
   * @returns all nodes of an ingredient-field in this recipe-panel
   */
  private getNodes(): any {
    return document.getElementsByClassName('mat-expansion-panel')[this.index].getElementsByClassName('ingredient-field');
  }

  /**
   * this recipe was opened
   */
  onExpand() {
    this.opened.emit(this.index);

  }

  /**
   * this recipe was closed
   */
  onClose() {
    this.opened.emit(-1);

  }

  ngAfterViewInit() {

    this.setFocusChanges();

  }


  public deleteRecipe() {

    this.databaseService.deleteRecipe(this.meal.firestoreElementId, this.recipe.firestoreElementId);

  }

  private setFocusChanges() {

    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < this.ingredientFieldNodes.length; i++) {
      this.ingredientFieldNodes[i].removeEventListener('keydown', this.keyListner(i));
      this.ingredientFieldNodes[i].addEventListener('keydown', this.keyListner(i));
    }
  }

  private keyListner(i: number, ): EventListenerOrEventListenerObject {
    return (event: any) => {
      if (event.key === 'Enter') {

        if (i + 1 < this.ingredientFieldNodes.length) {
          const nextFocus = i % 4 === 0 ? i + 2 : i + 1;
          (this.ingredientFieldNodes[nextFocus] as HTMLElement).focus();
        } else {

          this.addIngredientField();
        }
      }
    };
  }



  // save on destroy
  public async save(): Promise<boolean> {

    if (this.recipeForm.touched) {
      console.log('Autosave Recipe');
      this.saveRecipe();
      return true;
    }

    return false;

  }

  /**
   * Ändert die Teilnehmeranzahl
   *
   */
  changePartcipations() {

    this.specificRecipe.participants = this.recipeForm.value.participants;

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
    this.dataSource.data[this.dataSource.data.length] = { food: '', unit: '', measure: null };
    this.dataSource._updateChangeSubscription();
    this.recipeForm.markAsTouched();

    // set focus to new Element
    this.setFocusChanges();
    this.ingredientFieldNodes = this.getNodes();
    (this.ingredientFieldNodes[this.ingredientFieldNodes.length - 4] as HTMLElement).focus();

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
      this.recipe.ingredients[index].measure = Number.parseInt(value, 10) / this.calculateParticipantsNumber();

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
    const ex = /([0-9]|[.])+\t([a-z]|[ä]|[ü]|[ö]|[.])+\t([a-z]|[ä]|[ü]|[ö]|[0-9]|[ ](?!([0-9]|[.]|[0-9])+\t))+/gi;

    const ingredientsAsArray = value.match(ex).join().split(',');

    let i = index;

    for (const ing of ingredientsAsArray) {

      const ingredientAsArray = ing.split('\t');

      this.recipe.ingredients.push({
        food: ingredientAsArray[2],
        unit: ingredientAsArray[1],
        measure: Number.parseInt(ingredientAsArray[0], 10)
      });

      i++;
    }

    this.dataSource._updateChangeSubscription();
  }

  /**
   * Berechnet die Anzahl Teilnehmende dieses Rezeptes für die Berechnung.
   *
   * Beachtet dabei lokale Überschreibungen der Teilnehmeranzahl des Lagers im Rezept oder in der Mahlzeit
   * und berücksichtigt das "Vegi"-Feld...
   *
   */

  public calculateParticipantsNumber() {

    // Rezept nur für Vegetarier
    if (this.specificRecipe.vegi === 'vegiOnly') {
      return this.camp.vegetarier;

    } else {

      // Anzahl Vegis, die Abgezogen werdem
      const abzug = this.specificRecipe.vegi !== 'nonVegi' ? 0 : this.camp.vegetarier;

      // Anzahl wurde im Rezept Überschrieben
      if (this.specificRecipe.overrideParticipants) {

        return this.specificRecipe.participants - abzug;


      } else {

        // Anzahl Teilnehmer der Mahlzeit
        return (this.specificMeal.overrideParticipants ?
          // Anzahl wurde in der Mahlzeit überschrieben
          (this.specificMeal.participants - abzug) :
          // Anzahl wurde nicht überschrieben
          (this.camp.participants - abzug));

      }
    }

  }

  /**
   * Stellt die Beschreibung für die Anzahl Teilnehmende eines Rezeptes zusammen.
   * inkl. Anzeige Vegi oder nicht usw.
   *
   */
  public getPanelDescriptionParticipants() {

    if (this.specificRecipe.vegi === 'all') {

      return 'für ' + this.calculateParticipantsNumber() + ' Personen';

    }
    if (this.specificRecipe.vegi === 'vegiOnly') {

      return 'nur für Vegis (' + this.calculateParticipantsNumber() + ' P.)';

    }

    if (this.specificRecipe.vegi === 'nonVegi') {

      return 'nur für Nicht-Vegis (' + this.calculateParticipantsNumber() + ' P.)';

    }

  }

  saveRecipe() {

    // save data to firestore
    this.recipe.notes = this.recipeForm.value.notes;
    this.recipe.description = this.recipeForm.value.description;
    this.recipe.name = this.recipeForm.value.name;
    this.specificRecipe.overrideParticipants = this.recipeForm.value.overrideParticipants;
    this.specificRecipe.participants = this.recipeForm.value.participants;
    this.specificRecipe.vegi = this.recipeForm.value.vegi;

    this.databaseService.updateDocument(this.recipe.extractDataToJSON(), this.recipe.getDocPath());
    this.databaseService.updateDocument(this.specificRecipe.extractDataToJSON(), this.specificRecipe.getDocPath());

    // reset: deactivate save button
    this.recipeForm.markAsUntouched();

  }

}
