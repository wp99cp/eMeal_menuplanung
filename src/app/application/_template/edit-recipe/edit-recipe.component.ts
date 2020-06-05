import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Recipe} from '../../_class/recipe';
import {FormBuilder, FormGroup} from '@angular/forms';
import {HeaderNavComponent} from '../../../_template/header-nav/header-nav.component';
import {DatabaseService} from '../../_service/database.service';
import {OverwritenIngredient} from '../../_class/overwritableIngredient';
import {Ingredient} from '../../_interfaces/firestoreDatatypes';
import {ContextMenuNode, ContextMenuService} from '../../_service/context-menu.service';
import {HelpService} from "../../_service/help.service";

@Component({
  selector: 'app-edit-recipe',
  templateUrl: './edit-recipe.component.html',
  styleUrls: ['./edit-recipe.component.sass']
})
export class EditRecipeComponent implements OnInit {

  Arr = Array; // Array type captured in a variable
  Math = Math;
  Number = Number;

  public recipeForm: FormGroup;
  public ingredients: OverwritenIngredient[];

  @Input() public recipe: Recipe;
  @Input() public participants: number;
  @Output() newUnsavedChanges = new EventEmitter();
  public hasAccess = false;
  public selectedTableCell = null;
  public currentEditedField = null;
  public screenSize = 0;

  private oldValue;
  private isCurrentCellEditable = false;

  private multipleCellsSelected = false;
  private clipboardValue = '';
  private selectedIngredientID = '';

  constructor(
    private formBuilder: FormBuilder,
    private databaseService: DatabaseService,
    private contextMenuService: ContextMenuService,
    private helpService: HelpService) {

    helpService.addHelpMessage({
      title: 'Rezepte direkt bearbeiten',
      message: `Rezepte können auf direkt bearbeitet werden. <br>
                Klicke hierfür auf den Menü-Punkt "Rezepte" und wähle dann ein Rezept aus.`
    });

    helpService.addHelpMessage({
      title: 'Rezepte lokal Überschreiben',
      message: `(Bald schon...) Können Rezepte lokal überschrieben werden. D.h. du kannst in einem Rezept
                Zutaten hinzufügen und verändern, aber diese Änderungen gelten nur für das aktuelle Lager.
                Die Rezept-Vorlage bleibt dabei unverändert. <br>
                Nutze diese Funktion z.B. um die Mengen für ein Lager mit jüngeren/älteren Teilnehmenden anzupassen.
                Oder Falls zu keinen Zugriff auf die Rezept-Vorlage hast, aber dennoch Änderungen anbringen willst/musst!`
    });

  }

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
      this.setOverlySize(this.selectedTableCell);
      this.setAreaOverlay();

    });

    const node: ContextMenuNode = {
      node: document.getElementById(this.recipe.documentId + '-focus-overlay'),
      contextMenuEntries: [
        {
          icon: 'file_copy',
          name: 'Kopieren',
          shortCut: 'Strg+C',
          function: (event) => {
            navigator.clipboard.writeText(this.selectedTableCell.innerText);
          }
        },
        {
          icon: 'assignment',
          name: 'Einfügen',
          shortCut: 'Strg+V',
          // It's impossible...
          function: (event: Event) => alert('Bitte Benutze für das Einfügen die Tasten-Kombination Strg+V')
        },
        {
          icon: 'cut',
          name: 'Ausschneiden',
          shortCut: 'Strg+X',
          function: (event) => this.cutContent(event)
        },
        'Separator',
        {
          icon: 'delete',
          name: 'Zutat Löschen',
          shortCut: '',
          function: (event) => this.deleteIngredient(this.selectedTableCell.parentElement.parentElement.id)
        },
        'Separator',
        {
          icon: 'help',
          name: 'Hilfe / Erklärungen',
          shortCut: 'F1',
          function: (event) => this.helpService.openHelpPopup()
        }
      ]
    };
    this.contextMenuService.addContextMenuNode(node);

  }

  /**
   * Löscht ein Ingredient aus dem Rezept
   *
   * @param index Index des Ingredient = Zeile in der Tabelle
   */
  deleteIngredient(uniqueId: string) {

    console.log(uniqueId)

    if (!this.hasAccess) {
      return;
    }

    if (!this.hasAccess) {
      return;
    }

    const overlay = document.getElementById(this.recipe.documentId + '-focus-overlay');
    overlay.style.visibility = 'hidden';
    window.blur();

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

    if (this.isCurrentCellEditable) {
      return;
    }

    if (this.multipleCellsSelected) {

      await navigator.clipboard.writeText(this.clipboardValue);

    } else {
      await navigator.clipboard.writeText(this.selectedTableCell.innerText);

    }

    event.preventDefault();

  }

  public async pastContent(event: ClipboardEvent) {

    console.log('paste')

    if (!this.hasAccess) {
      return;
    }

    if (this.isCurrentCellEditable) {
      return;
    }

    if (this.multipleCellsSelected) {

      const inputFields = event.clipboardData.getData('text/plain').split('\r')[0].split('\t');
      const ingredient = this.ingredients.filter(i => i.unique_id === this.selectedIngredientID)[0];

      ingredient.measure = Number(inputFields[0]) ? Number(inputFields[0]) : 0;
      ingredient.unit = inputFields[2] ? inputFields[2] : '';
      ingredient.fresh = ['fresh', 'true', 'Frisch', 'frisch', 'Frischprod.', 'Frischprodukt'].includes(inputFields[3]);
      ingredient.food = inputFields[4] ? inputFields[4] : '';
      ingredient.comment = inputFields[5] ? inputFields[5] : '';

    } else {

      const inputField = (document.querySelector('.input-field') as HTMLInputElement);

      if (inputField) {
        const value = event.clipboardData.getData('Text');
        inputField.value = value;
      }
      this.newValue(inputField);

    }

    event.preventDefault();

    this.newUnsavedChanges.emit();
    HeaderNavComponent.turnOn('Speichern');


  }

  public async cutContent(event: ClipboardEvent) {

    if (this.isCurrentCellEditable) {
      return;
    }

    event.preventDefault();

    await navigator.clipboard.writeText(this.selectedTableCell.innerText);

    if (!this.hasAccess) {
      return;
    }

    if (!this.isCurrentCellEditable) {
      this.clearField();
    }

    // is needed to cover up the cutted text
    const overlay = document.getElementById(this.recipe.documentId + '-focus-overlay');
    overlay.style.backgroundColor = 'white';

  }

  public setFocus(target: EventTarget) {

    const overlay = document.getElementById(this.recipe.documentId + '-focus-overlay');

    // do nothing if cell is already selected and the selection is visible
    if (target === this.selectedTableCell && overlay.style.visibility === 'visible') {
      return;
    }

    this.unmarkIngredient();

    overlay.style.backgroundColor = 'transparent';
    overlay.style.visibility = 'visible';
    this.selectedTableCell = target as HTMLElement;

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

      this.selectNextElement(this.selectedTableCell);
      event.preventDefault();

    } else if ('ArrowRight' === event.key && !this.isCurrentCellEditable) {

      this.selectNextElement(this.selectedTableCell);
      event.preventDefault();

    } else if (['Tab'].includes(event.key)) {

      if (event.shiftKey) {
        this.selectPreviousElement(this.selectedTableCell);
      } else {
        this.selectNextElement(this.selectedTableCell);
      }

      event.preventDefault();

    } else if ('ArrowLeft' === event.key && !this.isCurrentCellEditable) {

      this.selectPreviousElement(this.selectedTableCell);
      event.preventDefault();

    } else if (['Escape'].includes(event.key)) {

      this.currentEditedField.value = this.oldValue;
      this.newValue(this.currentEditedField);
      this.disableEdit();
      event.preventDefault();

    } else if (['Home'].includes(event.key)) {

      this.setFocus(this.selectedTableCell.parentElement.firstElementChild.nextElementSibling);

    } else if (['End'].includes(event.key)) {

      this.setFocus(this.selectedTableCell.parentElement.lastElementChild.previousElementSibling);

    } else if (['Delete', 'Backspace'].includes(event.key)) {

      if (!this.hasAccess) {
        return;
      }

      if (!this.isCurrentCellEditable) {

        this.clearField();
        event.preventDefault();


      }

    } else if ('ArrowUp' === event.key && !this.isCurrentCellEditable) {

      let str = '';
      this.selectedTableCell.classList.forEach(classStr => str += '.' + classStr);

      const node = this.selectedTableCell.parentElement.parentElement.previousElementSibling?.firstElementChild?.querySelector(str);
      // Jump over delete and fresh
      if (!node.querySelector('data')) {
        return;
      }

      if (node) {
        this.setFocus(node);
      }

    } else if ('ArrowDown' === event.key && !this.isCurrentCellEditable) {

      let str = '';
      this.selectedTableCell.classList.forEach(classStr => str += '.' + classStr);

      const node = this.selectedTableCell.parentElement.parentElement.nextElementSibling?.firstElementChild?.querySelector(str);
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

      if (!this.hasAccess) {
        event.preventDefault();
        return;
      }

      if (!this.isCurrentCellEditable) {

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

    const ingredientId = this.selectedTableCell.parentElement.parentElement.id;
    this.updateValue((event as HTMLInputElement).value, ingredientId);

    HeaderNavComponent.turnOn('Speichern');
    this.newUnsavedChanges.emit();

  }

  public toggleFresh(ingredient: Ingredient) {

    if (!this.hasAccess) {
      return;
    }

    ingredient.fresh = !ingredient.fresh;

    HeaderNavComponent.turnOn('Speichern');
    this.newUnsavedChanges.emit();

  }

  public enableEdit() {

    if (!this.hasAccess) {
      return;
    }

    if (this.isCurrentCellEditable) {
      const overlay = document.getElementById(this.recipe.documentId + '-focus-overlay');
      const inputField = (overlay.querySelector('.input-field') as HTMLInputElement);
      inputField.select();

      return;
    }

    this.isCurrentCellEditable = true;


    const overlay = document.getElementById(this.recipe.documentId + '-focus-overlay');
    overlay.style.visibility = 'visible';

    this.currentEditedField = this.selectedTableCell;
    const inputField = (overlay.querySelector('.input-field') as HTMLInputElement);
    inputField.value = this.selectedTableCell.innerText;
    this.oldValue = this.selectedTableCell.innerText;
    inputField.style.opacity = '1';
    inputField.focus();
    inputField.style.cursor = 'text';

  }

  public disableEdit() {


    this.isCurrentCellEditable = false;

    if (this.currentEditedField == null) {
      return;
    }

    const overlay = document.getElementById(this.recipe.documentId + '-focus-overlay');
    const inputField = (overlay.querySelector('.input-field') as HTMLInputElement);
    inputField.style.opacity = '0';
    this.currentEditedField = null;

    overlay.style.visibility = 'hidden';
    window.blur();

  }

  public markIngredient(uniqueId: string) {

    this.selectedIngredientID = uniqueId;

    this.multipleCellsSelected = true;
    const ing = this.ingredients.filter(i => i.unique_id === uniqueId)[0];
    this.clipboardValue = `${ing.measure}\t${ing.measure * this.participants}\t${ing.unit}\t` +
      `${ing.fresh ? 'Frischprodukt' : ''}\t${ing.food}\t${ing.comment}`;

    // remove selector for singe element
    const overlay = document.getElementById(this.recipe.documentId + '-focus-overlay');
    overlay.style.visibility = 'hidden';

    // select ingredient
    const areaOverlay = document.getElementById(this.recipe.documentId + '-area-overlay');
    areaOverlay.style.visibility = 'visible';
    areaOverlay.focus();

    this.setAreaOverlay();

  }

  public contextMenu(event) {

    // event.preventDefault();

  }

  public unmarkIngredient() {

    this.multipleCellsSelected = false;

    // clear selection
    const areaOverlay = document.getElementById(this.recipe.documentId + '-area-overlay');
    areaOverlay.style.visibility = 'hidden';

  }

  private setAreaOverlay() {

    const areaOverlay = document.getElementById(this.recipe.documentId + '-area-overlay');
    const parent = areaOverlay.parentElement;
    const ingredient = document.getElementById(this.selectedIngredientID);
    areaOverlay.style.top = (ingredient.getBoundingClientRect().top - parent.getBoundingClientRect().top) + 'px';
    areaOverlay.style.left = (ingredient.getBoundingClientRect().left - parent.getBoundingClientRect().left) + 'px';
    areaOverlay.style.width = (ingredient.getBoundingClientRect().right - ingredient.getBoundingClientRect().left - 6) + 'px';
    areaOverlay.style.height = (ingredient.getBoundingClientRect().bottom - ingredient.getBoundingClientRect().top - 4) + 'px';


  }

  private updateValue(value, ingredientId) {


    const ingredient = this.ingredients.filter(ing => ing.unique_id === ingredientId)[0];

    let field: string = this.selectedTableCell.querySelector('data').value;

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


    if (target === null) {
      return;
    }

    const overlay = document.getElementById(this.recipe.documentId + '-focus-overlay');

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

    const overlay = document.getElementById(this.recipe.documentId + '-focus-overlay');
    const inputField = (overlay.querySelector('.input-field') as HTMLInputElement);
    inputField.value = '';
    this.newValue(this.selectedTableCell);

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
