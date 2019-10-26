import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ApplicationRoutingModule } from './application-routing.module';
import { WelcomPageComponent } from './welcom-page/welcom-page.component';
import { CampListPageComponent, DeleteCampComponent } from './camp-list-page/camp-list-page.component';

import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule, AngularFirestore } from '@angular/fire/firestore';
import { AngularFireAuthModule, AngularFireAuth } from '@angular/fire/auth';
import { environment } from '../../environments/environment';
import { MealListPageComponent } from './meal-list-page/meal-list-page.component';
import { AuthenticationService } from './_service/authentication.service';
import { EditCampPageComponent } from './edit-camp-page/edit-camp-page.component';
import { MatTableModule } from '@angular/material/table';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatStepperModule } from '@angular/material/stepper';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTabsModule } from '@angular/material/tabs';
import { MatExpansionModule } from '@angular/material/expansion';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { UserListComponent } from './_template/user-list/user-list.component'
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatListModule } from '@angular/material/list';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { WeekViewComponent, EditDayComponent } from './_template/week-view/week-view.component';
import { EditMealComponent } from './edit-meal/edit-meal.component';
import { EditRecipeComponent } from './_template/edit-recipe/edit-recipe.component';
import { IngredientFieldComponent } from './_template/ingredient-field/ingredient-field.component';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { AddMealComponent } from './_template/add-meal/add-meal.component';
import { ExportCampComponent } from './export-camp/export-camp.component';


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
    AuthenticationService
  ],
  entryComponents: [
    DeleteCampComponent,
    EditDayComponent,
    AddMealComponent
  ]
})

export class ApplicationModule {


  constructor(private auth: AuthenticationService) {
    this.auth.signIn();

  }


}
