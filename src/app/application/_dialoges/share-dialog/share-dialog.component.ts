import { Component, OnInit, Inject } from '@angular/core';
import { Camp } from '../../_class/camp';
import { MAT_DIALOG_DATA } from '@angular/material';
import { DatabaseService } from '../../_service/database.service';
import { AuthenticationService } from '../../_service/authentication.service';
import { map } from 'rxjs/operators';
import { Meal } from '../../_class/meal';
import { Recipe } from '../../_class/recipe';

@Component({
  selector: 'app-share-dialog',
  templateUrl: './share-dialog.component.html',
  styleUrls: ['./share-dialog.component.sass']
})
export class ShareDialogComponent implements OnInit {

  public camp: Camp;

  constructor(
    @Inject(MAT_DIALOG_DATA) data: { camp: Camp },
    private databaseService: DatabaseService,
    private auth: AuthenticationService, ) {

    this.camp = data.camp;

  }

  ngOnInit() {
  }

  /** A user get selected */
  selectUser(selectedCoworkers) {


    this.auth.getCurrentUser().pipe(map(user => {
      const accessData = Camp.generateCoworkersList(user.uid, selectedCoworkers);
      accessData[user.uid] = 'owner';
      return accessData;
    })).subscribe(access => {

      this.camp.access = access;

      this.databaseService.updateAccessData(access, Camp.getPath(this.camp.firestoreElementId));
      this.camp.days.forEach(day => day.meals.forEach(meal => {
        this.databaseService.updateAccessData(access, Meal.getPath(meal.firestoreElementId));

        this.databaseService.getRecipes(meal.firestoreElementId).subscribe(recipes =>
          recipes.forEach(recipe =>
            this.databaseService.updateAccessData(access, Recipe.getPath(meal.firestoreElementId, recipe.firestoreElementId))
          ));

      }));

    });

  }

}
