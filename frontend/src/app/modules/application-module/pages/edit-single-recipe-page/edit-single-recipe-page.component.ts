import {Component, OnInit} from '@angular/core';
import {Recipe} from '../../classes/recipe';
import {keepEditedObject} from '../../classes/keep-edited-objects';
import {Observable} from 'rxjs';
import {mergeMap, switchMap, take} from 'rxjs/operators';
import {ActivatedRoute} from '@angular/router';
import {DatabaseService} from '../../services/database.service';
import {AutoSaveService, Saveable} from '../../services/auto-save.service';
import {ShareDialogComponent} from '../../dialoges/share-dialog/share-dialog.component';
import {MatDialog} from '@angular/material/dialog';
import {SingleRecipeInfoComponent} from '../../dialoges/single-recipe-info/single-recipe-info.component';
import {SettingsService} from '../../services/settings.service';
import {HeaderNavComponent} from "../../../../shared/components/header-nav/header-nav.component";

@Component({
  standalone: false,
  selector: 'app-edit-single-recipe-page',
  templateUrl: './edit-single-recipe-page.component.html',
  styleUrls: ['./edit-single-recipe-page.component.sass']
})
export class EditSingleRecipePageComponent implements OnInit, Saveable {

  public recipe: Observable<Recipe>;
  private unsavedChanges = false;
  private unsavedRecipe: Recipe;

  constructor(
    private route: ActivatedRoute,
    private dbService: DatabaseService,
    private autosave: AutoSaveService,
    public dialog: MatDialog,
    public settingsService: SettingsService) {

    autosave.register(this);

    // Ladet das Rezept von der URL
    this.recipe = this.route.url.pipe(
      // a recipe of a previous url must not replace the current one
      switchMap(url => this.dbService.getRecipeById(url[1].path)),
      keepEditedObject(() => this.unsavedChanges));

    // check access
    this.recipe.subscribe(async recipe => {
      if (await this.dbService.canWrite(recipe)) {
        HeaderNavComponent.turnOn('Teilen');
      } else {
        HeaderNavComponent.turnOff('Teilen');
      }
    });

  }

  ngOnInit() {

    HeaderNavComponent.addToHeaderNav({
      active: true,
      description: 'Informationen zum Rezept',
      name: 'Rezept Info',
      action: (() => this.recipeInfos()),
      icon: 'info',
    });

    HeaderNavComponent.addToHeaderNav({
      active: false,
      description: 'Rezept freigeben',
      name: 'Teilen',
      action: (() => this.share()),
      icon: 'share',
    });

  }

  /**
   * Opens the dialog for the settings of this recipe
   *
   */
  recipeInfos() {

    // the dialog loads the recipe again, it has to contain the unsaved changes
    this.autosave.saveChanges();

    this.recipe
      .pipe(take(1))
      .pipe(mergeMap(recipe =>
      this.dialog.open(SingleRecipeInfoComponent, {
        height: '618px',
        width: '1000px',
        data: recipe
      }).afterClosed()))
      .subscribe((recipe: Recipe) => {
        if (recipe) {
          this.dbService.updateDocument(recipe);
        }
      });

  }

  share() {

    this.recipe
      .pipe(take(1))
      .pipe(mergeMap(recipe =>
      this.dialog.open(ShareDialogComponent, {
        height: '618px',
        width: '1000px',
        data: {
          objectName: 'Rezept',
          currentAccess: recipe.getAccessData(),
          documentPath: recipe.path,
          helpMessageId: 'camp-authorization-infos',
          accessLevels: ['editor', 'viewer']
        }
      }).afterClosed())).subscribe();


  }

  async save(): Promise<boolean> {

    if (!this.unsavedChanges) {
      return false;
    }

    // changes made while the recipe gets written have to be saved again
    this.unsavedChanges = false;

    try {
      await this.dbService.saveDocument(this.unsavedRecipe);
    } catch (error) {
      this.unsavedChanges = true;
      throw error;
    }

    return true;

  }

  newUnsavedChanges(recipe: Recipe) {

    this.unsavedChanges = true;
    this.unsavedRecipe = recipe;
    this.autosave.newUnsavedChanges();

  }

}
