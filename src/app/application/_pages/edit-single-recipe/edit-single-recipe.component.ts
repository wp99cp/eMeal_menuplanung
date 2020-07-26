import {Component, OnInit} from '@angular/core';
import {Recipe} from '../../_class/recipe';
import {Observable} from 'rxjs';
import {mergeMap, take} from 'rxjs/operators';
import {ActivatedRoute, Router} from '@angular/router';
import {DatabaseService} from '../../_service/database.service';
import {HeaderNavComponent} from '../../../_template/header-nav/header-nav.component';
import {AutoSaveService, Saveable} from '../../_service/auto-save.service';
import {ShareDialogComponent} from '../../_dialoges/share-dialog/share-dialog.component';
import {MatDialog} from '@angular/material/dialog';
import {HelpService} from '../../_service/help.service';
import {SingleRecipeInfoComponent} from "../../_dialoges/single-recipe-info/single-recipe-info.component";

@Component({
  selector: 'app-edit-single-recipe',
  templateUrl: './edit-single-recipe.component.html',
  styleUrls: ['./edit-single-recipe.component.sass']
})
export class EditSingleRecipeComponent implements OnInit, Saveable {

  public recipe: Observable<Recipe>;
  private unsavedChanges = false;
  private unsavedRecipe: Recipe;

  constructor(
    private route: ActivatedRoute,
    private dbService: DatabaseService,
    private autosave: AutoSaveService,
    public dialog: MatDialog,
    private helpService: HelpService,
    private router: Router) {

    autosave.register(this);

    /*
    TODO: Zur Zeit werden die Änderungen nicht in realtime synchronisiert, da die Pipeline
     auf ein Element beschnitten wird... Das Problem ist aber, dass ansonsten die Änderungen
     nicht korrekt gespeichert werden, nach dem diese bereits einmal gespeichert wurden
     (d.h. nur ein Speichervorgang funktioniert).
   */
    // Ladet das Rezept von der URL
    this.recipe = this.route.url.pipe(mergeMap(
      url => this.dbService.getRecipeById(url[1].path).pipe(take(1))));

    // check access
    this.recipe.subscribe(async recipe => {
      if (await this.dbService.canWrite(recipe)) {
        HeaderNavComponent.turnOn('Teilen');
      } else {
        HeaderNavComponent.turnOff('Teilen');
      }
    });

    helpService.addHelpMessage({
      title: 'Rezepte freigeben gemeinsam bearbeiten.',
      message: `Rezepte können mit anderen Nutzern von eMeal-Menüplanung geteilt werden.
                Dabei kannst du ein Rezept mit den folgenden Berechtigungen teilen: <br>
                <ul>
                    <li><b>Besitzer:</b> Diese Rolle hat derjenige, der das Rezept erstellt hat. Der Besitzer hat
                    uneingeschränkten Zugriff auf das Rezept.</li>
                    <li><b>Administrator:</b> Kann das Rezept bearbeiten (Zutaten ändern, hinzufügen oder löschen) und
                     es in eigenen Mahlzeiten verwenden. Kann das Lager mit andern teilen, nicht aber löschen.</li>
                     <li><b>Leser:</b> Kann das Rezept und die Zutaten betrachten. Kann eine eigene Kopie erstellen
                     und diese anschliessend bearbeiten.</li>
                </ul>
                <br>
                <img width="100%" src="/assets/img/help_info_messages/Share_Recipe.png">`,
      url: router.url,
      ref: 'recipe-authorization-infos'
    });


  }

  ngOnInit() {

    HeaderNavComponent.addToHeaderNav({
      active: false,
      description: 'Änderungen speichern',
      name: 'Speichern',
      action: (() => this.save()),
      icon: 'save',
      separatorAfter: true
    });

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

    this.recipe.pipe(mergeMap(recipe =>
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

    this.recipe.pipe(mergeMap(recipe =>
      this.dialog.open(ShareDialogComponent, {
        height: '618px',
        width: '1000px',
        data: {
          objectName: 'Rezept',
          currentAccess: recipe.getAccessData(),
          documentPath: recipe.path,
          /*
            TODO: Dies führt zu einer Sicherheitslücke! Falls der owner in dieser Liste steht, so kann ein Nutzer ohne
             owner-Berechtigung einen anderen Benutzer zum Onwer erklären. DIes muss über eine Security-Rule gelöst werden!
           */
          accessLevels: ['editor', 'viewer']
        }
      }).afterClosed()))
      .subscribe(() => {

      });


  }

  save(): Promise<boolean> {

    HeaderNavComponent.turnOff('Speichern');

    return new Promise<boolean>(async resolve => {

      if (this.unsavedChanges) {

        await this.dbService.updateDocument(this.unsavedRecipe);
        resolve(true);

      }

      resolve(false);

    });

  }

  newUnsavedChanges(recipe: Recipe) {

    HeaderNavComponent.turnOn('Speichern');
    this.unsavedChanges = true;
    this.unsavedRecipe = recipe;

  }

}
