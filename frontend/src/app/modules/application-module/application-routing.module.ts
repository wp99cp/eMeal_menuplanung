import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {AppSettingsPageComponent} from './pages/app-settings-page/app-settings-page.component';
import {CampListPageComponent} from './pages/camp-list-page/camp-list-page.component';
import {EditCampPageComponent} from './pages/edit-camp-page/edit-camp-page.component';
import {EditMealPageComponent} from './pages/edit-meal-page/edit-meal-page.component';
import {WelcomPageComponent} from './pages/welcom-page/welcom-page.component';
import {AutoSaveService} from './services/auto-save.service';
import {ExportCampPageComponent} from './pages/export-camp-page/export-camp-page.component';
import {RecipeListPageComponent} from './pages/recipe-list-page/recipe-list-page.component';
import {EditSingleRecipePageComponent} from './pages/edit-single-recipe-page/edit-single-recipe-page.component';
import {MealListPageComponent} from './pages/meal-list-page/meal-list-page.component';
import {EditSingleMealPageComponent} from './pages/edit-single-meal-page/edit-single-meal-page.component';


const routes: Routes = [

  {
    path: '',
    component: WelcomPageComponent
  },
  {
    path: 'settings',
    component: AppSettingsPageComponent
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
    path: 'recipes',
    component: RecipeListPageComponent
  },
  {
    path: 'meals/:id',
    component: EditSingleMealPageComponent,
    canDeactivate: [AutoSaveService]
  },
  {
    path: 'recipes/:id',
    component: EditSingleRecipePageComponent,
    canDeactivate: [AutoSaveService]
  },
  {
    path: 'camps/:id',
    component: EditCampPageComponent,
    canDeactivate: [AutoSaveService]
  },
  {
    path: 'camps/:id/export',
    component: ExportCampPageComponent

  },
  {
    path: 'camps/:id/meals/:mealId/:specificId',
    component: EditMealPageComponent,
    canDeactivate: [AutoSaveService]
  }


];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ApplicationRoutingModule {


}
