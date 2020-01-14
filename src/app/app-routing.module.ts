import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';


const routes: Routes = [

  {
    path: '',
    loadChildren: () => import('./informations/informations.module').then(mod => mod.InformationsModule)
  },
  {
    path: 'app',
    loadChildren: () => import('./application/application.module').then(mod => mod.ApplicationModule)
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
