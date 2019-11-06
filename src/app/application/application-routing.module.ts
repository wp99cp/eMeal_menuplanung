import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CampListPageComponent } from './camp-list-page/camp-list-page.component';
import { EditCampPageComponent } from './edit-camp-page/edit-camp-page.component';
import { EditMealComponent } from './edit-meal/edit-meal.component';
import { ExportCampComponent } from './export-camp/export-camp.component';
import { MealListPageComponent } from './meal-list-page/meal-list-page.component';
import { WelcomPageComponent } from './welcom-page/welcom-page.component';


const routes: Routes = [

  {
    path: '',
    component: WelcomPageComponent,
    data: { title: 'Menuplanung für Lager', path: ['eMeal'] }
  },
  {
    path: 'camps',
    component: CampListPageComponent,
    data: { title: 'meine Lager', path: ['eMeal', 'Meine Lager'] }
  },
  {
    path: 'meals',
    component: MealListPageComponent
  },
  {
    path: 'camps/:id',
    component: EditCampPageComponent,
    data: {
      title: 'Chlauslager 2019',
      path: ['eMeal', 'meine Lager', 'Chlauslager 2019']
    }
  },
  {
    path: 'camps/:id/export',
    component: ExportCampComponent,
    data: {
      title: 'Chlauslager 2019 exportieren',
      path: ['eMeal', 'meine Lager', 'Chlauslager 2019', 'exportieren']
    }

  },
  {
    path: 'camps/:id/days/:dayNumber/meals/:mealId',
    component: EditMealComponent,
    data: {
      title: 'Sonntag Znacht (Älplermaccaroni)',
      path: ['eMeal', 'meine Lager', 'Chlauslager 2019', 'Sonntag (1. Dezember)', 'Znacht (Älplermaccaroni)']
    }
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ApplicationRoutingModule { }
