import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MarkdownModule } from 'ngx-markdown';
import { HttpClient } from '@angular/common/http';


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
  imports: [RouterModule.forRoot(routes), 
    MarkdownModule.forRoot({ loader: HttpClient })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
