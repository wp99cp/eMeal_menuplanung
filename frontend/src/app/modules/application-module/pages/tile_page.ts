import {Observable} from 'rxjs';
import {FirestoreObject} from '../classes/firebaseObject';
import {DatabaseService} from '../services/database.service';
import {take} from 'rxjs/operators';
import {MatSnackBar} from '@angular/material/snack-bar';
import {MatDialog} from '@angular/material/dialog';
import {HeaderNavComponent} from "../../../shared/components/header-nav/header-nav.component";

export abstract class TileListPage<T extends FirestoreObject> {

  // TODO: add sort option

  public dbElements: Observable<T[]>;
  public filteredElements: T[];
  public access = {};
  protected filterValue = '';
  protected markedAsDeleted = [];
  protected filterFn: (dbElement: T) => boolean;
  protected dbElementName = 'Element';
  protected filterDocIDs: string[] = [];

  protected constructor(
    private databaseServcie: DatabaseService,
    private messageBar: MatSnackBar,
    dbElements: Observable<T[]>,
    public dialog: MatDialog) {

    this.dbElements = dbElements;

    // load recipes with an change listner active
    this.dbElements.subscribe(recipes => {

      // update visible recipes
      this.updateVisibleElements();

      // save access
      recipes.forEach(async recipe =>
        this.access[recipe.documentId] = await this.databaseServcie.canWrite(recipe)
      );

    });

  }

  public abstract copy(element: T): void;

  public abstract newElement(): void;

  applyFilter(event: any, docIds: string[] = []) {

    console.log(event)
    console.log(docIds)

    this.filterValue = event;
    this.filterDocIDs = docIds;

    // update the values
    this.updateVisibleElements();

  }

  async delete(element: T) {

    // current user isn't the owner of the recipe
    // only the owner can delete a recipe
    if (!await this.databaseServcie.isOwner(element)) {
      this.messageBar.open('Das ' + this.dbElementName + ' kann nicht gelöscht werden. Fehlende Berechtigung!', '', {duration: 2000});
      return;
    }

    // Test additional Conditions
    if (!await this.deleteConditions(element)) {
      this.messageBar.open('Das ' + this.dbElementName + ' kann nicht gelöscht werden.', '', {duration: 2000});
      return;
    }

    // hide recipe and mark as deleted
    this.markedAsDeleted.push(element.documentId);
    this.updateVisibleElements();

    // Löscht das Rezept oder breicht den Vorgang ab, je nach Aktion der snackBar...
    const snackBar = this.messageBar.open(this.dbElementName + ' wurde gelöscht.', 'Rückgängig', {duration: 4000});
    let canDelete = true;

    snackBar.onAction().subscribe(() => {

      canDelete = false;

      // set visibility back to visible
      this.markedAsDeleted = this.markedAsDeleted.filter(elem => elem !== element.documentId);
      this.updateVisibleElements();

    });

    snackBar.afterDismissed().subscribe(() => {

      if (canDelete) {
        this.deleteElement(element);
      }

    });

  }

  protected abstract deleteElement(element: T): void;

  protected abstract deleteConditions(element: T): Promise<boolean>;

  protected addButtonNew() {

    HeaderNavComponent.addToHeaderNav({
      active: true,
      description: this.dbElementName + ' hinzufügen',
      name: this.dbElementName + ' erstellen',
      action: (() => this.newElement()),
      icon: 'add_circle_outline',
    });

  }

  protected updateVisibleElements() {

    this.dbElements
      .pipe(take(1))
      .subscribe(elements =>
        this.filteredElements = elements.filter(elem =>
          this.filterFn(elem) && !this.markedAsDeleted.includes(elem.documentId))
      );

  }

}
