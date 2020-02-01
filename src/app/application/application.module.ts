import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { AngularFireModule } from '@angular/fire';
import { AngularFireAuth, AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFirestore, AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireFunctionsModule, FUNCTIONS_REGION } from '@angular/fire/functions';
import { AngularFireStorageModule } from '@angular/fire/storage';
import { ReactiveFormsModule } from '@angular/forms';
import { MatRadioModule, MatSelectModule, MatSnackBarModule, MatSortModule } from '@angular/material';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { DateAdapter, MatNativeDateModule } from '@angular/material/core';
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
import { environment } from 'src/environments/environment';

import { VersionHistoryModule } from '../modules/version-history/version-history.module';
import { SwissDateAdapter } from '../utils/format-datapicker';
import { AddMealComponent } from './_dialoges/add-meal/add-meal.component';
import { AddRecipeComponent } from './_dialoges/add-recipe/add-recipe.component';
import { CampInfoComponent } from './_dialoges/camp-info/camp-info.component';
import { CreateMealComponent } from './_dialoges/create-meal/create-meal.component';
import { CreateRecipeComponent } from './_dialoges/create-recipe/create-recipe.component';
import { EditDayComponent } from './_dialoges/edit-day/edit-day.component';
import { ImportComponent } from './_dialoges/import/import.component';
import { MealInfoComponent } from './_dialoges/meal-info/meal-info.component';
import { RecipeInfoComponent } from './_dialoges/recipe-info/recipe-info.component';
import { ShareDialogComponent } from './_dialoges/share-dialog/share-dialog.component';
import { AppSettingsPageComponent } from './_pages/app-settings-page/app-settings-page.component';
import { CampListPageComponent } from './_pages/camp-list-page/camp-list-page.component';
import { DeleteCampComponent } from './_pages/camp-list-page/delete-camp.component';
import { EditCampPageComponent } from './_pages/edit-camp-page/edit-camp-page.component';
import { EditMealComponent } from './_pages/edit-meal/edit-meal.component';
import { ExportCampComponent } from './_pages/export-camp/export-camp.component';
import { FeedbackPageComponent } from './_pages/feedback-page/feedback-page.component';
import { MealListPageComponent } from './_pages/meal-list-page/meal-list-page.component';
import { WelcomPageComponent } from './_pages/welcom-page/welcom-page.component';
import { AuthenticationService } from './_service/authentication.service';
import { AutoSaveService } from './_service/auto-save.service';
import { DatabaseService } from './_service/database.service';
import { DownloadComponent } from './_template/download/download.component';
import { EditRecipeComponent } from './_template/edit-recipe/edit-recipe.component';
import { IngredientFieldComponent } from './_template/ingredient-field/ingredient-field.component';
import { ListOfUsersComponent } from './_template/list-of-users/list-of-users.component';
import { MealsOverviewComponent } from './_template/meals-overview/meals-overview.component';
import { UserListComponent } from './_template/user-list/user-list.component';
import { WeekViewComponent } from './_template/week-view/week-view.component';
import { ApplicationRoutingModule } from './application-routing.module';


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
    ExportCampComponent,
    FeedbackPageComponent,
    ImportComponent,
    MealsOverviewComponent,
    CreateMealComponent,
    ListOfUsersComponent,
    AppSettingsPageComponent,
    ExportCampComponent,
    DownloadComponent,
    ShareDialogComponent,
    CampInfoComponent,
    MealInfoComponent,
    RecipeInfoComponent,
    AddRecipeComponent,
    CreateRecipeComponent
  ],
  providers: [
    AngularFirestore,
    AngularFireAuth,
    AuthenticationService,
    DatabaseService,
    AutoSaveService,
    SwissDateAdapter,
    { provide: FUNCTIONS_REGION, useValue: 'europe-west1' },
    { provide: DateAdapter, useClass: SwissDateAdapter },

  ],
  imports: [
    CommonModule,
    ApplicationRoutingModule,
    AngularFireModule.initializeApp(environment.firebaseConfig, 'eMeal - Menuplanung'),
    AngularFireFunctionsModule,
    AngularFireStorageModule,
    AngularFirestoreModule,
    AngularFireAuthModule,
    VersionHistoryModule,
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
    MatSlideToggleModule,
    MatSnackBarModule,
    MatPaginatorModule,
    MatTableModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatRadioModule,
    MatSelectModule
  ],

  entryComponents: [
    DeleteCampComponent,
    EditDayComponent,
    AddMealComponent,
    EditDayComponent,
    ImportComponent,
    CreateMealComponent,
    MealsOverviewComponent,
    ShareDialogComponent,
    CampInfoComponent,
    MealInfoComponent,
    RecipeInfoComponent,
    AddRecipeComponent,
    CreateRecipeComponent
  ],
  exports: [
    MatTableModule,
    MatPaginatorModule,
    MatSortModule
  ],
  bootstrap: [
    CampListPageComponent
  ]
})

export class ApplicationModule {

  constructor(private auth: AuthenticationService) {

    this.auth.signIn();


  }

}
