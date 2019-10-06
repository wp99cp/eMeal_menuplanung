import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';


const routes: Routes = [

  {
    path: '',
    loadChildren: () => import('./informations/informations.module').then(mod => mod.InformationsModule)
  },
  {
    path: 'app',
    loadChildren: () => import('./application/application.module').then(mod => mod.ApplicationModule)
  },
  {
    path: 'app/settings',
    loadChildren: () => import('./settings/settings.module').then(mod => mod.SettingsModule)
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
