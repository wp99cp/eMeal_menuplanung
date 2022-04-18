import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {LandingPage} from "./pages/landing-page/landingPage.component";
import {SignInComponent} from "./pages/sign-in-page/sign-in.component";
import {AccessGuard} from "./guards/AccessGuard";
import {SignInCallbackComponent} from "./pages/sign-in-callback-page/sign-in-callback.component";
import {ErrorPageComponent} from "./pages/error-page/error-page.component";


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
    loadChildren: () => import('./modules/information-module/information.module').then(mod => mod.InformationModule)
  },
  {
    path: 'app',
    loadChildren: () => import('./modules/application-module/application.module').then(mod => mod.ApplicationModule),
    data: {requiresLogin: true, redirectURL: '/login'},
    canActivate: [AccessGuard]
  },
  {
    path: 'app/admin',
    loadChildren: () => import('./modules/admin-module/admin-pages.module').then(mod => mod.AdminPagesModule),
    data: {requiresLogin: true, requiresAdminRights: true, redirectURL: '/app'},
    canActivate: [AccessGuard]
  },
  {
    path: '**',
    component: ErrorPageComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {relativeLinkResolution: 'legacy'})],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
