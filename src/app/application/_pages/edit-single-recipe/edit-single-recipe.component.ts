import {Component, OnInit} from '@angular/core';
import {Recipe} from '../../_class/recipe';
import {Observable} from 'rxjs';
import {mergeMap, take} from 'rxjs/operators';
import {ActivatedRoute} from '@angular/router';
import {DatabaseService} from '../../_service/database.service';
import {HeaderNavComponent} from '../../../_template/header-nav/header-nav.component';
import {AutoSaveService, Saveable} from '../../_service/auto-save.service';

@Component({
  selector: 'app-edit-single-recipe',
  templateUrl: './edit-single-recipe.component.html',
  styleUrls: ['./edit-single-recipe.component.sass']
})
export class EditSingleRecipeComponent implements OnInit, Saveable {

  public recipe: Observable<Recipe>;
  private unsavedChanges = false;
  private unsavedRecipe: Recipe;

  constructor(private route: ActivatedRoute, private dbService: DatabaseService, private autosave: AutoSaveService) {

    autosave.register(this);

    // Ladet das Rezept von der URL
    this.recipe = this.route.url.pipe(mergeMap(
      url => this.dbService.getRecipeById(url[1].path).pipe(take(1))));

    /*
      TODO: Zur Zeit werden die Änderungen nicht in realtime synchronisiert, da die Pipeline
       auf ein Element beschnitten wird... Das Problem ist aber, dass ansonsten die Änderungen
       nicht korrekt gespeichert werden, nach dem diese bereits einmal gespeichert wurden
       (d.h. nur ein Speichervorgang funktioniert).
     */

  }

  ngOnInit() {

    HeaderNavComponent.addToHeaderNav({
      active: false,
      description: 'Änderungen speichern',
      name: 'Speichern',
      action: (() => this.save()),
      icon: 'save'
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
