import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { WelcomPageComponent } from './welcom-page/welcom-page.component';
import { CampListPageComponent } from './camp-list-page/camp-list-page.component';
import { MealListPageComponent } from './meal-list-page/meal-list-page.component';
import { EditCampPageComponent } from './edit-camp-page/edit-camp-page.component';
import { EditMealComponent } from './edit-meal/edit-meal.component';
import { ExportCampComponent } from './export-camp/export-camp.component';


const routes: Routes = [

  {
    path: '',
    component: WelcomPageComponent
  },
  {
    path: 'camps',
    component: CampListPageComponent
  },
  {
    path: 'meals',
    component: MealListPageComponent
  },
  {
    path: 'camps/:id',
    component: EditCampPageComponent
  },
  {
    path: 'camps/:id/export',
    component: ExportCampComponent
  },
  {
    path: 'camps/:id/days/:dayNumber/meals/:mealId',
    component: EditMealComponent
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ApplicationRoutingModule { }
