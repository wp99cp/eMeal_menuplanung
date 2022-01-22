import {NgModule} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatMenuModule} from '@angular/material/menu';
import {MatToolbarModule} from '@angular/material/toolbar';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {ServiceWorkerModule} from '@angular/service-worker';

import {environment} from '../environments/environment';
import {HeaderNavComponent} from './_template/header-nav/header-nav.component';
import {MainMenuComponent} from './_template/main-menu/main-menu.component';
import {TemplateFooterComponent} from './_template/template-footer/template-footer.component';
import {TemplateHeaderComponent} from './_template/template-header/template-header.component';
import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {HttpClientModule} from '@angular/common/http';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatIconModule} from '@angular/material/icon';
import {LandingPage} from './landingPage/landingPage.component';
import {MarkdownModule} from 'ngx-markdown';
import {AngularFireAuth, AngularFireAuthModule} from '@angular/fire/compat/auth';
import {AuthenticationService} from './application/_service/authentication.service';
import {AngularFireModule} from '@angular/fire/compat';
import {SignInComponent} from './sign-in/sign-in.component';
import {MatInputModule} from '@angular/material/input';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {AngularFireFunctions} from '@angular/fire/compat/functions';
import {SignInCallbackComponent} from './sign-in-callback/sign-in-callback.component';
import {MatDialogModule} from '@angular/material/dialog';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {ErrorPageComponent} from './error-page/error-page.component';
import {AngularFirestore, AngularFirestoreModule} from '@angular/fire/compat/firestore';
import {AccessGuard} from './AccessGuard';
import {DateAdapter} from '@angular/material/core';
import {SwissDateAdapter} from './utils/format-datapicker';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import { EmealFeaturesComponent } from './landingPage/emeal-features/emeal-features.component';
import { FeatureItemComponent } from './landingPage/emeal-features/feature-item/feature-item.component';
import { TeaserImagesComponent } from './landingPage/teaser-images/teaser-images.component';
import { DevelopEnviromentBannerComponent } from './develop-enviroment-banner/develop-enviroment-banner.component';

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
    DevelopEnviromentBannerComponent,
  ],
    imports: [

        AngularFireModule.initializeApp(environment.firebaseConfig, 'eMeal - Menuplanung'),
        AngularFireAuthModule,
        HttpClientModule,
        BrowserModule,
        AppRoutingModule,
        BrowserAnimationsModule,

        // Material Design for the entire app
        MatToolbarModule,
        MatMenuModule,
        MatTooltipModule,
        MatButtonModule,
        MatIconModule,
        ServiceWorkerModule.register('ngsw-worker.js', {enabled: environment.production}),
        MarkdownModule,
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
