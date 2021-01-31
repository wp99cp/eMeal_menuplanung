import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {AppSettingsPageComponent} from './_pages/app-settings-page/app-settings-page.component';
import {CampListPageComponent} from './_pages/_list-pages/camp-list-page/camp-list-page.component';
import {EditCampPageComponent} from './_pages/_edit-pages/edit-camp-page/edit-camp-page.component';
import {EditMealComponent} from './_pages/_edit-pages/edit-meal/edit-meal.component';
import {WelcomPageComponent} from './_pages/welcom-page/welcom-page.component';
import {AutoSaveService} from './_service/auto-save.service';
import {ExportCampComponent} from './_pages/export-camp/export-camp.component';
import {RecipeListComponent} from './_pages/_list-pages/recipe-list/recipe-list.component';
import {EditSingleRecipeComponent} from './_pages/_edit-pages/edit-single-recipe/edit-single-recipe.component';
import {MealListComponent} from './_pages/_list-pages/meal-list/meal-list.component';
import {MarkdownModule} from 'ngx-markdown';
import {EditSingleMealComponent} from './_pages/_edit-pages/edit-single-meal/edit-single-meal.component';


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
    component: MealListComponent
  },
  {
    path: 'recipes',
    component: RecipeListComponent
  },
  {
    path: 'meals/:id',
    component: EditSingleMealComponent,
    canDeactivate: [AutoSaveService]
  },
  {
    path: 'recipes/:id',
    component: EditSingleRecipeComponent,
    canDeactivate: [AutoSaveService]
  },
  {
    path: 'camps/:id',
    component: EditCampPageComponent,
    canDeactivate: [AutoSaveService]
  },
  {
    path: 'camps/:id/export',
    component: ExportCampComponent

  },
  {
    path: 'camps/:id/meals/:mealId/:specificId',
    component: EditMealComponent,
    canDeactivate: [AutoSaveService]
  }


];

@NgModule({
  imports: [RouterModule.forChild(routes), MarkdownModule.forChild()],
  exports: [RouterModule]
})
export class ApplicationRoutingModule {


}
