import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { AngularFireModule } from '@angular/fire';
import { AngularFireAuth, AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFirestore, AngularFirestoreModule } from '@angular/fire/firestore';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { environment } from '../../environments/environment';
import { ApplicationRoutingModule } from './application-routing.module';
import { CampListPageComponent, DeleteCampComponent } from './_pages/camp-list-page/camp-list-page.component';
import { EditCampPageComponent } from './_pages/edit-camp-page/edit-camp-page.component';
import { EditMealComponent } from './_pages/edit-meal/edit-meal.component';
import { ExportCampComponent } from './_pages/export-camp/export-camp.component';
import { MealListPageComponent } from './_pages/meal-list-page/meal-list-page.component';
import { WelcomPageComponent } from './_pages/welcom-page/welcom-page.component';
import { AuthenticationService } from './_service/authentication.service';
import { AddMealComponent } from './_template/add-meal/add-meal.component';
import { EditRecipeComponent } from './_template/edit-recipe/edit-recipe.component';
import { IngredientFieldComponent } from './_template/ingredient-field/ingredient-field.component';
import { UserListComponent } from './_template/user-list/user-list.component';
import { WeekViewComponent } from './_template/week-view/week-view.component';
import { DatabaseService } from './_service/database.service';
import { EditDayComponent } from './_template/edit-day/edit-day.component';
import { AngularFireFunctionsModule, FUNCTIONS_REGION, FUNCTIONS_ORIGIN } from '@angular/fire/functions';


@NgModule({
  declarations: [
    WelcomPageComponent,
    CampListPageComponent,
    MealListPageComponent,
    EditCampPageComponent,
    UserListComponent,
    DeleteCampComponent,
    EditDayComponent,
    WeekViewComponent,
    EditMealComponent,
    EditRecipeComponent,
    IngredientFieldComponent,
    AddMealComponent,
    ExportCampComponent
  ],
  imports: [
    CommonModule,
    ApplicationRoutingModule,
    AngularFireModule.initializeApp(environment.firebaseConfig, 'eMeal - Menuplanung'),

    AngularFireFunctionsModule,
    AngularFirestoreModule,
    AngularFireAuthModule,
    ReactiveFormsModule,
    // Material Design
    MatTableModule,
    MatProgressBarModule,
    MatInputModule,
    MatPaginatorModule,
    MatTooltipModule,
    MatStepperModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatTabsModule,
    MatExpansionModule,
    MatCheckboxModule,
    MatListModule,
    MatGridListModule,
    MatIconModule,
    MatDialogModule,
    MatCardModule,
    DragDropModule,
    MatSlideToggleModule
  ],
  providers: [
    AngularFirestore,
    AngularFireAuth,
    AuthenticationService,
    DatabaseService,
    // { provide: FUNCTIONS_ORIGIN, useValue: 'http://localhost:4200' }
    // { provide: FUNCTIONS_REGION, useValue: 'europe-west1' }
  ],
  entryComponents: [
    DeleteCampComponent,
    EditDayComponent,
    AddMealComponent,
    EditDayComponent
  ]
})

export class ApplicationModule {


  constructor(private auth: AuthenticationService) {

    this.auth.signIn();

  }


}
