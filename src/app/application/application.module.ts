import { NgModule, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ApplicationRoutingModule } from './application-routing.module';
import { WelcomPageComponent } from './welcom-page/welcom-page.component';
import { CampListPageComponent } from './camp-list-page/camp-list-page.component';

import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule, AngularFirestore } from '@angular/fire/firestore';
import { AngularFireAuthModule, AngularFireAuth } from '@angular/fire/auth';
import { environment } from '../../environments/environment';
import { MealListPageComponent } from './meal-list-page/meal-list-page.component';
import { AuthenticationService } from './_service/authentication.service';
import { CampListElementComponent } from './_template/camp-list-element/camp-list-element.component';
import { EditCampPageComponent } from './edit-camp-page/edit-camp-page.component';


@NgModule({
  declarations: [WelcomPageComponent, CampListPageComponent, MealListPageComponent, CampListElementComponent, EditCampPageComponent],
  imports: [
    CommonModule,
    ApplicationRoutingModule,
    AngularFireModule.initializeApp(environment.firebaseConfig, 'eMeal - Menuplanung'),
    AngularFirestoreModule,
    AngularFireAuthModule
  ],
  providers: [
    AngularFirestore,
    AngularFireAuth,
    AuthenticationService]
})

export class ApplicationModule {


  constructor(private auth: AuthenticationService) {

    this.auth.signIn();


  }

}
