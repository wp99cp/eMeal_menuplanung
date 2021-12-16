import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {MarkdownModule} from 'ngx-markdown';
import {HttpClient} from '@angular/common/http';
import {LandingPage} from './landingPage/landingPage.component';
import {SignInComponent} from './sign-in/sign-in.component';
import {SignInCallbackComponent} from './sign-in-callback/sign-in-callback.component';
import {ErrorPageComponent} from './error-page/error-page.component';
import {AccessGuard} from './AccessGuard';


const routes: Routes = [


  {
    path: '',
    component: LandingPage

  },
  {
    path: 'login',
    component: SignInComponent,
    data: {notSignInRequired: true, redirectURL: '/app'},
    canActivate: [AccessGuard]
  },
  {
    path: 'login/oauth-callback',
    component: SignInCallbackComponent
  },
  {
    path: 'infos',
    loadChildren: () => import('./informations/informations.module').then(mod => mod.InformationsModule)
  },
  {
    path: 'app',
    loadChildren: () => import('./application/application.module').then(mod => mod.ApplicationModule),
    data: {requiresLogin: true, redirectURL: '/login'},
    canActivate: [AccessGuard]
  },
  {
    path: 'app/admin',
    loadChildren: () => import('./admin-pages/admin-pages.module').then(mod => mod.AdminPagesModule),
    data: {requiresLogin: true, requiresAdminRights: true, redirectURL: '/app'},
    canActivate: [AccessGuard]
  },
  {
    path: '**',
    component: ErrorPageComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {relativeLinkResolution: 'legacy'}),
    MarkdownModule.forRoot({loader: HttpClient}),
    MarkdownModule.forChild()
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
