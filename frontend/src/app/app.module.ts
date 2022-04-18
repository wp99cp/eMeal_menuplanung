import {NgModule} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatToolbarModule} from '@angular/material/toolbar';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

import {environment} from '../environments/environment';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {HttpClientModule} from '@angular/common/http';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatIconModule} from '@angular/material/icon';
import {LandingPage} from './pages/landing-page/landingPage.component';
import {AngularFireAuth, AngularFireAuthModule} from '@angular/fire/compat/auth';
import {AuthenticationService} from './modules/application-module/services/authentication.service';
import {AngularFireModule} from '@angular/fire/compat';
import {SignInComponent} from './pages/sign-in-page/sign-in.component';
import {AngularFireFunctions} from '@angular/fire/compat/functions';
import {SignInCallbackComponent} from './pages/sign-in-callback-page/sign-in-callback.component';
import {ErrorPageComponent} from './pages/error-page/error-page.component';
import {AngularFirestore, AngularFirestoreModule} from '@angular/fire/compat/firestore';
import {AccessGuard} from './guards/AccessGuard';
import {DateAdapter} from '@angular/material/core';
import {TemplateHeaderComponent} from "./shared/components/template-header/template-header.component";
import {MainMenuComponent} from "./shared/components/main-menu/main-menu.component";
import {HeaderNavComponent} from "./shared/components/header-nav/header-nav.component";
import {EmealFeaturesComponent} from "./components/emeal-features/emeal-features.component";
import {FeatureItemComponent} from "./components/feature-item/feature-item.component";
import {TeaserImagesComponent} from "./components/teaser-images/teaser-images.component";
import {DevEnvBanner} from "./shared/components/dev-env-banner/dev-env-banner.component";
import {TemplateFooterComponent} from "./shared/components/template-footer/template-footer.component";
import {SwissDateAdapter} from "./shared/utils/format-datapicker";
import {MatSlideToggleModule} from "@angular/material/slide-toggle";
import {MatProgressBarModule} from "@angular/material/progress-bar";
import {MatDialogModule} from "@angular/material/dialog";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatInputModule} from "@angular/material/input";
import {MatSnackBarModule} from "@angular/material/snack-bar";

@NgModule({
  declarations: [
    AppComponent,
    TemplateHeaderComponent,
    TemplateFooterComponent,
    MainMenuComponent,
    HeaderNavComponent,
    LandingPage,
    SignInComponent,
    SignInCallbackComponent,
    ErrorPageComponent,
    EmealFeaturesComponent,
    FeatureItemComponent,
    TeaserImagesComponent,
    DevEnvBanner,
  ],
  imports: [

    AngularFireModule.initializeApp(environment.firebaseConfig, 'eMeal - Menüplanung'),
    AngularFireAuthModule,
    HttpClientModule,
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,

    // Material Design for the entire app
    MatToolbarModule,
    MatTooltipModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatSlideToggleModule,
    MatDialogModule,
    ReactiveFormsModule,
    FormsModule,
    MatSnackBarModule,
    MatProgressBarModule
  ],
  providers: [
    AngularFireAuth,
    AngularFirestore,
    AuthenticationService,
    AngularFireFunctions,
    AngularFirestoreModule,
    AccessGuard,
    SwissDateAdapter,
    {provide: DateAdapter, useClass: SwissDateAdapter},

  ],
  bootstrap: [AppComponent]
})
export class AppModule {

  constructor() {

  }


}
