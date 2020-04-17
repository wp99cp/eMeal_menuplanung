import { Component, OnInit } from '@angular/core';
import { DatabaseService } from '../../_service/database.service';
import { Recipe } from '../../_class/recipe';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material';

@Component({
  selector: 'app-recipe-list',
  templateUrl: './recipe-list.component.html',
  styleUrls: ['./recipe-list.component.sass']
})
export class RecipeListComponent implements OnInit {

  public recipes: Observable<Recipe[]>;
  public filteredRecipes: Recipe[];

  constructor(private dbService: DatabaseService,
   public snackBar: MatSnackBar) { }

  ngOnInit() {

    this.recipes = this.dbService.getEditableRecipes();

    this.recipes.subscribe(recipes => {
      this.filteredRecipes = recipes;
    });

  }

  applyFilter(event: any) {

    this.recipes.pipe(take(1)).subscribe(recs => {
      this.filteredRecipes = recs.filter(rec => rec.name.toLocaleLowerCase().includes(event.toLocaleLowerCase()));
    });

  }

  delete(recipe: Recipe){

    if(recipe.usedInMeals.length == 0){

    document.getElementById(recipe.documentId).classList.toggle('hidden');

    const snackBar = this.snackBar.open('Rezept wurde gelöscht.', 'Rückgängig', { duration: 4000 });

    // Löscht das Rezept oder breicht den Vorgang ab, je nach Aktion der snackBar...
    let canDelete = true;
    snackBar.onAction().subscribe(() => {
      canDelete = false;
      document.getElementById(recipe.documentId).classList.toggle('hidden');

    });
    snackBar.afterDismissed().subscribe(() => {

      if (canDelete) {
        this.dbService.deleteDocument(recipe);
      }

    });
    } else{

        this.snackBar.open('Das Rezept kann nicht gelöscht werden, da es verwendet wird!', '', { duration: 2000 });

    }

  }

}
