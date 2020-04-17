import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Meal } from '../../_class/meal';
import { DatabaseService } from '../../_service/database.service';
import { take } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material';

@Component({
  selector: 'app-meal-list',
  templateUrl: './meal-list.component.html',
  styleUrls: ['./meal-list.component.sass']
})
export class MealListComponent implements OnInit {

  public meals: Observable<Meal[]>;
  public filteredMeals: Meal[];

  constructor(private dbService: DatabaseService,
    public snackBar: MatSnackBar) { }


  ngOnInit() {

    this.meals = this.dbService.getEditableMeals();

    this.meals.subscribe(meals => {
      this.filteredMeals = meals;
    });

  }

  applyFilter(event: any) {

    this.meals.pipe(take(1)).subscribe(meals => {
      this.filteredMeals = meals.filter(meal => meal.name.toLocaleLowerCase().includes(event.toLocaleLowerCase()));
    });

  }

  delete(meal: Meal) {

    this.dbService.getNumberOfUses(meal.documentId).subscribe(numb => {

      if (numb === 0) {

        document.getElementById(meal.documentId).classList.toggle('hidden');

        const snackBar = this.snackBar.open('Rezept wurde gelöscht.', 'Rückgängig', { duration: 4000 });

        // Löscht das Rezept oder breicht den Vorgang ab, je nach Aktion der snackBar...
        let canDelete = true;
        snackBar.onAction().subscribe(() => {
          canDelete = false;
          document.getElementById(meal.documentId).classList.toggle('hidden');

        });
        snackBar.afterDismissed().subscribe(() => {

          if (canDelete) {
            this.dbService.deleteRecipesRefs(meal.documentId);
            this.dbService.deleteDocument(meal);
          }

        });

      } else {
        this.snackBar.open('Das Rezept kann nicht gelöscht werden, da es noch verwendet wird!', '', { duration: 2000 });

      }

    })



  }

}
