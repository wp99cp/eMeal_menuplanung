import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Recipe} from '../../_class/recipe';
import {FormBuilder, FormGroup} from '@angular/forms';
import {HeaderNavComponent} from '../../../_template/header-nav/header-nav.component';
import {DatabaseService} from '../../_service/database.service';
import {OverwritenIngredient} from '../../_class/overwritableIngredient';
import {Ingredient} from '../../_interfaces/firestoreDatatypes';

@Component({
  selector: 'app-edit-recipe',
  templateUrl: './edit-recipe.component.html',
  styleUrls: ['./edit-recipe.component.sass']
})
export class EditRecipeComponent implements OnInit {

  Arr = Array; // Array type captured in a variable
  Math = Math;

  public recipeForm: FormGroup;
  public ingredients: OverwritenIngredient[];

  @Input() public recipe: Recipe;
  @Input() public participants: number;
  @Output() newUnsavedChanges = new EventEmitter();
  public hasAccess = false;
  public lastElement = null;
  public currentEditedField = null;
  private ingredientFieldNodes: Element[];
  private oldValue;
  private isEditable = false;

  constructor(
    private formBuilder: FormBuilder,
    private databaseService: DatabaseService) {
  }

  public screenSize = 0;

  async ngOnInit() {

    this.recipe.getIngredients().subscribe(ings => this.ingredients = ings as OverwritenIngredient[]);
    this.recipeForm = this.formBuilder.group({notes: this.recipe.notes});

    // check if the current user has access
    this.hasAccess = await this.databaseService.canWrite(this.recipe);

    this.recipeForm.statusChanges.subscribe(() => {
      this.newUnsavedChanges.emit();
      HeaderNavComponent.turnOn('Speichern');
      this.recipe.notes = this.recipeForm.value.notes;
    });

    this.screenSize = window.innerWidth;

    window.addEventListener('resize', () => {
      this.screenSize = window.innerWidth;
      this.setOverlySize(this.lastElement);
    });


  }

  /**
   * Löscht ein Ingredient aus dem Rezept
   *
   * @param index Index des Ingredient = Zeile in der Tabelle
   */
  deleteIngredient(uniqueId: string) {

    if (!this.hasAccess) {
      return;
    }

    this.recipe.removeIngredient(uniqueId, 'a_unique_id');
    HeaderNavComponent.turnOn('Speichern');

    this.newUnsavedChanges.emit();

  }

  /**
   * Fügt ein leeres Ingredient-Field am Ende der Tabelle hinzu.
   */
  addIngredientField(target) {

    if (!this.hasAccess) {
      return;
    }

    const ingredient = {
      food: '',
      unit: '',
      measure: null,
      comment: '',
      fresh: false,
      unique_id: Recipe.createIngredientId(this.recipe.documentId)
    };
    // generiert leere Daten für ein neues Ingredient
    this.recipe.addIngredient(ingredient); // fügt es in der Datenstruktur ein

    setTimeout(() => {
      let str = '';
      target.classList.forEach(classStr => str += '.' + classStr);
      this.setFocus(target.parentElement.parentElement.previousElementSibling.firstElementChild.querySelector(str));
    }, 20);

    this.newUnsavedChanges.emit();
    HeaderNavComponent.turnOn('Speichern');

  }

  public async copyContent(event: ClipboardEvent) {

    if (this.isEditable) {
      return;
    }

    await navigator.clipboard.writeText(this.lastElement.innerText);
    event.preventDefault();

  }

  public async pastContent(event: ClipboardEvent) {

    if (this.isEditable) {
      return;
    }

    const inputField = (document.querySelector('.input-field') as HTMLInputElement);

    if (inputField) {
      const value = event.clipboardData.getData('Text');
      inputField.value = value;
    }
    this.newValue(inputField);
    event.preventDefault();

    this.newUnsavedChanges.emit();
    HeaderNavComponent.turnOn('Speichern');


  }

  public async cutContent(event: ClipboardEvent) {

    if (this.isEditable) {
      return;
    }

    event.preventDefault();

    await navigator.clipboard.writeText(this.lastElement.innerText);

    if (!this.isEditable) {
      this.clearField();
    }

    // is needed to cover up the cutted text
    const overlay = document.getElementById('focus-overlay');
    overlay.style.backgroundColor = 'white';

  }

  public setFocus(target: EventTarget) {

    const overlay = document.getElementById('focus-overlay');
    overlay.style.backgroundColor = 'transparent';
    overlay.style.visibility = 'visible';
    this.lastElement = target as HTMLElement;

    this.setOverlySize(target as HTMLElement);

    const inputField = overlay.querySelector('.input-field') as HTMLInputElement;

    inputField.style.cursor = 'default';
    inputField.value = '';
    inputField.style.visibility = 'visible';
    inputField.style.opacity = '0';
    inputField.focus();

  }

  public pressKey(event: KeyboardEvent) {

    if ('Enter' === event.key) {

      this.selectNextElement(this.lastElement);
      event.preventDefault();

    } else if ('ArrowRight' === event.key && !this.isEditable) {

      this.selectNextElement(this.lastElement);
      event.preventDefault();

    } else if (['Tab'].includes(event.key)) {

      if (event.shiftKey) {
        this.selectPreviousElement(this.lastElement);
      } else {
        this.selectNextElement(this.lastElement);
      }

      event.preventDefault();

    } else if ('ArrowLeft' === event.key && !this.isEditable) {

      this.selectPreviousElement(this.lastElement);
      event.preventDefault();

    } else if (['Escape'].includes(event.key)) {

      this.currentEditedField.value = this.oldValue;
      this.newValue(this.currentEditedField);
      this.disableEdit();
      event.preventDefault();

    } else if (['Home'].includes(event.key)) {

      this.setFocus(this.lastElement.parentElement.firstElementChild.nextElementSibling);

    } else if (['End'].includes(event.key)) {

      this.setFocus(this.lastElement.parentElement.lastElementChild.previousElementSibling);

    } else if (['Delete', 'Backspace'].includes(event.key)) {

      if (!this.isEditable) {

        this.clearField();
        event.preventDefault();


      }

    } else if ('ArrowUp' === event.key && !this.isEditable) {

      let str = '';
      this.lastElement.classList.forEach(classStr => str += '.' + classStr);

      const node = this.lastElement.parentElement.parentElement.previousElementSibling?.firstElementChild?.querySelector(str);
      // Jump over delete and fresh
      if (!node.querySelector('data')) {
        return;
      }

      if (node) {
        this.setFocus(node);
      }

    } else if ('ArrowDown' === event.key && !this.isEditable) {

      let str = '';
      this.lastElement.classList.forEach(classStr => str += '.' + classStr);

      const node = this.lastElement.parentElement.parentElement.nextElementSibling?.firstElementChild?.querySelector(str);
      // Jump over delete and fresh
      if (!node.querySelector('data')) {
        return;
      }

      if (node) {
        this.setFocus(node);
      }


    } else if (event.key.length === 1) {

      if (event.altKey || event.ctrlKey) {
        return;
      }

      if (!this.isEditable) {

        this.enableEdit();
        this.clearField();

      }

    }

  }

  public selectPreviousElement(currentElement: Element) {

    this.disableEdit();

    if (currentElement.previousElementSibling == null) {
      currentElement = currentElement.parentElement.parentElement.previousElementSibling?.lastElementChild?.lastElementChild;
    }

    // End of Table
    if (currentElement == null) {
      return;
    }

    currentElement = currentElement.previousElementSibling;

    // Jump over delete and fresh
    if (!currentElement.querySelector('data')) {
      this.selectPreviousElement(currentElement);
      return;
    }

    this.setFocus(currentElement);

  }

  public selectNextElement(currentElement: Element) {

    this.disableEdit();

    if (currentElement.nextElementSibling == null) {
      currentElement = currentElement.parentElement.parentElement.nextElementSibling?.firstElementChild?.firstElementChild;
    }

    // End of Table
    if (currentElement == null) {
      return;
    }

    currentElement = currentElement.nextElementSibling;

    // Jump over delete and fresh
    if (!currentElement.querySelector('data')) {
      this.selectNextElement(currentElement);
      return;
    }

    this.setFocus(currentElement);

  }

  public newValue(event: EventTarget) {

    const ingredientId = this.lastElement.parentElement.parentElement.id;
    this.updateValue((event as HTMLInputElement).value, ingredientId);

    HeaderNavComponent.turnOn('Speichern');
    this.newUnsavedChanges.emit();

  }

  public toggleFresh(ingredient: Ingredient) {

    ingredient.fresh = !ingredient.fresh;

    HeaderNavComponent.turnOn('Speichern');
    this.newUnsavedChanges.emit();

  }

  public enableEdit() {

    if (this.isEditable) {
      return;
    }

    this.isEditable = true;


    const overlay = document.getElementById('focus-overlay');
    this.currentEditedField = this.lastElement;
    const inputField = (overlay.querySelector('.input-field') as HTMLInputElement);
    inputField.value = this.lastElement.innerText;
    this.oldValue = this.lastElement.innerText;
    inputField.style.opacity = '1';
    inputField.focus();
    inputField.style.cursor = 'text';

  }

  public disableEdit() {

    this.isEditable = false;

    if (this.currentEditedField == null) {
      return;
    }

    const overlay = document.getElementById('focus-overlay');
    const inputField = (overlay.querySelector('.input-field') as HTMLInputElement);
    inputField.style.opacity = '0';
    this.currentEditedField = null;

    overlay.style.visibility = 'hidden';
    window.blur();

  }

  private updateValue(value, ingredientId) {


    const ingredient = this.ingredients.filter(ing => ing.unique_id === ingredientId)[0];

    let field: string = this.lastElement.querySelector('data').value;

    if (value === undefined) {
      value = '';
    }

    if (field.includes('measure')) {
      value = parseFloat(value);

      if (field === 'measure_calc') {
        field = 'measure';
        value = value / this.participants;
      }

    }

    ingredient[field] = value;

  }

  private setOverlySize(target: HTMLElement) {

    const overlay = document.getElementById('focus-overlay');
    const parent = overlay.parentElement;
    const tableElem = target;
    overlay.style.top = (tableElem.getBoundingClientRect().top - parent.getBoundingClientRect().top) + 'px';
    overlay.style.left = (tableElem.getBoundingClientRect().left - parent.getBoundingClientRect().left) + 'px';
    overlay.style.width = (tableElem.getBoundingClientRect().right - tableElem.getBoundingClientRect().left - 3) + 'px';
    overlay.style.height = (tableElem.getBoundingClientRect().bottom - tableElem.getBoundingClientRect().top - 4) + 'px';

    const inputField = overlay.querySelector('.input-field') as HTMLInputElement;
    inputField.style.top = (tableElem.getBoundingClientRect().top - parent.getBoundingClientRect().top) + 'px';
    inputField.style.left = (tableElem.getBoundingClientRect().left - parent.getBoundingClientRect().left) + 'px';
    inputField.style.width = (tableElem.getBoundingClientRect().right - tableElem.getBoundingClientRect().left - 10) + 'px';
    inputField.style.height = (tableElem.getBoundingClientRect().bottom - tableElem.getBoundingClientRect().top - 10) + 'px';

  }

  private clearField() {

    const overlay = document.getElementById('focus-overlay');
    const inputField = (overlay.querySelector('.input-field') as HTMLInputElement);
    inputField.value = '';
    this.newValue(this.lastElement);

    this.newUnsavedChanges.emit();
    HeaderNavComponent.turnOn('Speichern');

  }

  /**
   * Parst einen Input als Tabelle
   */
  private parseTableInput(index: number, value: string) {

    // TODO: Fix...
    throw new Error('Not working');

    /*
    this.recipe.getIngredients().splice(index, 1);

    // Regulärer Ausdruck für das Parsing des Inputs
    const ex = /([0-9]|[.][0-9])+\t([a-z]|[ä]|[ü]|[ö]|[.])+\t([a-z]|[ä]|[ü]|[ö]|[0-9]|[ ](?!([0-9]|[.])+\t))+/gi;

    const ingredientsAsArray = value.match(ex).join().split(',');

    let i = index;

    for (const ing of ingredientsAsArray) {

      const ingredientAsArray = ing.split('\t');

      this.recipe.addIngredient({
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


     */

  }

}
