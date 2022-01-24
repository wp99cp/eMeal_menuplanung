import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {Meal} from '../../classes/meal';
import {DatabaseService} from '../../services/database.service';

@Component({
  selector: 'app-deep-copy-meal',
  templateUrl: './deep-copy-meal.component.html',
  styleUrls: ['./deep-copy-meal.component.sass']
})
export class DeepCopyMealComponent {

  public isTemplate;

  constructor(
    private databaseService: DatabaseService,
    @Inject(MAT_DIALOG_DATA) public meal: Meal
  ) {

    databaseService.canWrite(meal).then(res => {
      this.isTemplate = !res && meal.getAccessData().all_users === 'viewer';
    });

  }

}
