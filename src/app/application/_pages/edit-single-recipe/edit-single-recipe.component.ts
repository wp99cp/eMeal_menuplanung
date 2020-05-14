import {Component, OnInit} from '@angular/core';
import {Recipe} from '../../_class/recipe';
import {Observable} from 'rxjs';
import {mergeMap} from 'rxjs/operators';
import {ActivatedRoute} from '@angular/router';
import {DatabaseService} from '../../_service/database.service';
import {HeaderNavComponent} from '../../../_template/header-nav/header-nav.component';
import {Saveable} from '../../_service/auto-save.service';

@Component({
  selector: 'app-edit-single-recipe',
  templateUrl: './edit-single-recipe.component.html',
  styleUrls: ['./edit-single-recipe.component.sass']
})
export class EditSingleRecipeComponent implements OnInit, Saveable {

  public recipe: Observable<Recipe>;
  private unsavedChanges = false;
  private unsavedRecipe: Recipe;

  constructor(private route: ActivatedRoute, private dbService: DatabaseService) {

    // load recipe...
    // Ladet das Lager von der URL
    this.recipe = this.route.url.pipe(mergeMap(
      url => this.dbService.getRecipeById(url[1].path)));

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
