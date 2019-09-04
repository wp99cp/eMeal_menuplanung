import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ApplicationRoutingModule } from './application-routing.module';
import { WelcomPageComponent } from './welcom-page/welcom-page.component';
import { CampListPageComponent } from './camp-list-page/camp-list-page.component';

import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule, AngularFirestore } from '@angular/fire/firestore';
import { AngularFireAuthModule, AngularFireAuth } from '@angular/fire/auth';
import { environment } from '../../environments/environment';
import { DatabaseService } from './_service/database.service';


@NgModule({
  declarations: [WelcomPageComponent, CampListPageComponent],
  imports: [
    CommonModule,
    ApplicationRoutingModule,
    AngularFireModule.initializeApp(environment.firebaseConfig, 'eMeal - Menuplanung'),
    AngularFirestoreModule,
    AngularFireAuthModule  ]
})
export class ApplicationModule { 

    public databaseService: DatabaseService;

    constructor(db: AngularFirestore, afAuth: AngularFireAuth){
      this.databaseService = new DatabaseService(db, afAuth);
    }

}
