import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';
import { User } from 'firebase';
import { map } from 'rxjs/operators';

import { Camp } from '../../_class/camp';
import { Meal } from '../../_class/meal';
import { Recipe } from '../../_class/recipe';
import { AccessData } from '../../_interfaces/firestoreDatatypes';
import { AuthenticationService } from '../../_service/authentication.service';
import { DatabaseService } from '../../_service/database.service';

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

  jsonConcat(o1, o2) {
    for (const key in o2) {
      o1[key] = o2[key];
    }
    return o1;
  }

  /** A user get selected */
  selectUser(selectedCoworkers) {

    throw new Error('Not yet implemented!');

    /*
    this.auth.getCurrentUser()
      .pipe(this.createCoworkerList(selectedCoworkers))
      .subscribe((access: AccessData) => {

        // merge the old access data with the new one
        access = this.jsonConcat(access, this.camp.getAccessData());

        this.camp.setAccessData(access);

        this.databaseService.updateAccessData(access, Camp.getPath(this.camp.documentId));
        this.camp.days.forEach(day => day.meals.subscribe(meals => meals.forEach(meal => {
          this.databaseService.updateAccessData(access, Meal.getPath(meal.documentId));

          this.databaseService.getRecipes(meal.documentId).subscribe(recipes =>
            recipes.forEach(recipe =>
              this.databaseService.updateAccessData(access, Recipe.getPath(recipe.documentId))
            ));

        })));

      });

      */
  }


  private createCoworkerList(selectedCoworkers: any) {

    throw new Error('Not yet implemented!');

    /*
    return map((user: User) => {
      const accessData = Camp.generateCoworkersList(user.uid, selectedCoworkers);
      accessData[user.uid] = 'owner';
      return accessData;
    });

    */

  }
}
