import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { Camp } from '../../_class/camp';
import { Meal } from '../../_class/meal';
import { SpecificMeal } from '../../_class/specific-meal';
import { DatabaseService } from '../../_service/database.service';
import { TemplateHeaderComponent } from 'src/app/_template/template-header/template-header.component';
import { mergeMap } from 'rxjs/operators';

@Component({
  selector: 'app-edit-meal',
  templateUrl: './edit-meal.component.html',
  styleUrls: ['./edit-meal.component.sass']
})
export class EditMealComponent implements OnInit {

  protected mealInfo: FormGroup;
  protected specificMeal: Observable<SpecificMeal>;

  private meal: Observable<Meal>;
  private camp: Observable<Camp>;
  private campId: string;
  private mealId: string;

  constructor(private route: ActivatedRoute, private formBuilder: FormBuilder, private databaseService: DatabaseService) { }

  ngOnInit() {

    // load camp from url
    this.route.url.subscribe(url => {

      // get mealId as last part of the url
      this.afterGetURL(url);

    });

    this.meal.subscribe(meal => {
      this.mealInfo = this.formBuilder.group({
        title: meal.title
      });
    });



  }


  private afterGetURL(url) {

    this.campId = url[url.length - 3].path;
    this.mealId = url[url.length - 1].path;
    // load Meal and specific meal
    this.camp = this.databaseService.getCampById(this.campId);
    this.meal = this.databaseService.getMealById(this.mealId, this.campId);
    this.specificMeal = this.databaseService.getSpecificMeal(this.mealId, this.campId);

    console.log('hier');
    this.camp.subscribe(camp => this.meal.subscribe(meal => this.setHeaderInfo(camp, meal)));

  }

  /** setzt die HeaderInfos für die aktuelle Seite */
  private setHeaderInfo(camp, meal): void {

    TemplateHeaderComponent.title = meal.title;
    TemplateHeaderComponent.path = ['eMeal', 'meine Lager', camp.name, '', meal.title];

  }

}
