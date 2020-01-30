import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material';
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

  constructor(private formBuilder: FormBuilder, private databaseService: DatabaseService, public dialog: MatDialog) { }

  ngOnInit() {

    this.dataSource = new MatTableDataSource<Ingredient>(this.recipe.ingredients);

    this.recipeForm = this.formBuilder.group({
      notes: this.recipe.notes,
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

    // set Timeout: sowohl zu optischen Zwecken als auch
    // damit beim Wechsel zwischen Rezepten das Menu nicht verschwindet
    setTimeout(() => {


      HeaderNavComponent.remove('Infos zum Rezept');
      HeaderNavComponent.remove('Rezept löschen');

      HeaderNavComponent.addToHeaderNav({
        active: true,
        description: 'Informationen zum Rezept',
        name: 'Infos zum Rezept',
        action: (() => this.openRecipeInfo()),
        icon: 'info'
      });
      HeaderNavComponent.addToHeaderNav({
        active: true,
        description: 'Rezept löschen',
        name: 'Rezept löschen',
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
    HeaderNavComponent.remove('Infos zum Rezept');
    HeaderNavComponent.remove('Rezept löschen');

    HeaderNavComponent.addToHeaderNav({
      active: false,
      description: 'Wähle zuerst ein Rezept',
      name: 'Infos zum Rezept',
      action: (() => null),
      icon: 'info'
    });
    HeaderNavComponent.addToHeaderNav({
      active: false,
      description: 'Wähle zuerst ein Rezept',
      name: 'Rezept löschen',
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
    this.databaseService.deleteRecipe(this.meal.firestoreElementId, this.recipe.firestoreElementId);

  }


  // TODO: better solution, multiple action listeners vermeiden!!!
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

  private keyListner(i: number, ): EventListenerOrEventListenerObject {
    return (event: any) => {
      if (event.key === 'Enter') {

        if (i + 1 < this.ingredientFieldNodes.length) {
          console.log(i)
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
      this.recipe.ingredients[index].measure = Number.parseFloat(value) / this.calculateParticipantsNumber();

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

  async saveRecipe() {

    this.recipe.notes = this.recipeForm.value.notes;


    this.databaseService.updateDocument(this.recipe.extractDataToJSON(), this.recipe.getDocPath());
    this.databaseService.updateDocument(this.specificRecipe.extractDataToJSON(), this.specificRecipe.getDocPath());

    // reset: deactivate save button
    this.recipeForm.markAsUntouched();

  }

}
