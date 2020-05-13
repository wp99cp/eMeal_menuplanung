import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AppSettingsPageComponent } from './_pages/app-settings-page/app-settings-page.component';
import { CampListPageComponent } from './_pages/camp-list-page/camp-list-page.component';
import { EditCampPageComponent } from './_pages/edit-camp-page/edit-camp-page.component';
import { EditMealComponent } from './_pages/edit-meal/edit-meal.component';
import { FeedbackPageComponent } from './_pages/feedback-page/feedback-page.component';
import { WelcomPageComponent } from './_pages/welcom-page/welcom-page.component';
import { AutoSaveService } from './_service/auto-save.service';
import { ExportCampComponent } from './_pages/export-camp/export-camp.component';
import { HelpPageComponent } from './_pages/help-page/help-page.component';
import { RecipeListComponent } from './_pages/recipe-list/recipe-list.component';
import { EditSingleRecipeComponent } from './_pages/edit-single-recipe/edit-single-recipe.component';
import { MealListComponent } from './_pages/meal-list/meal-list.component';
import { MarkdownModule } from 'ngx-markdown';
import {SignInComponent} from '../sign-in/sign-in.component';


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
    path: 'feedback',
    component: FeedbackPageComponent
  },
  {
    path: 'camps',
    component: CampListPageComponent
  },
  {
    path: 'hilfe',
    component: HelpPageComponent
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
    path: 'recipes/:id',
    component: EditSingleRecipeComponent
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
