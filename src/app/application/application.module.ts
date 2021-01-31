import {DragDropModule} from '@angular/cdk/drag-drop';
import {CommonModule, Location} from '@angular/common';
import {NgModule} from '@angular/core';
import {AngularFireModule} from '@angular/fire';
import {AngularFireAuth, AngularFireAuthModule} from '@angular/fire/auth';
import {AngularFirestore, AngularFirestoreModule} from '@angular/fire/firestore';
import {AngularFireFunctionsModule, FUNCTIONS_REGION} from '@angular/fire/functions';
import {AngularFireStorageModule} from '@angular/fire/storage';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {DateAdapter, MatNativeDateModule} from '@angular/material/core';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatDialog, MatDialogModule} from '@angular/material/dialog';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatListModule} from '@angular/material/list';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatStepperModule} from '@angular/material/stepper';
import {MatTableModule} from '@angular/material/table';
import {MatTabsModule} from '@angular/material/tabs';
import {MatTooltipModule} from '@angular/material/tooltip';
import {environment} from 'src/environments/environment';
import {VersionHistoryModule} from '../modules/version-history/version-history.module';
import {SwissDateAdapter} from '../utils/format-datapicker';
import {ApplicationRoutingModule} from './application-routing.module';
import {AddMealComponent} from './_dialoges/add-meal/add-meal.component';
import {AddRecipeComponent} from './_dialoges/add-recipe/add-recipe.component';
import {CampInfoComponent} from './_dialoges/camp-info/camp-info.component';
import {CreateCampComponent} from './_dialoges/create-camp/create-camp.component';
import {CreateMealComponent} from './_dialoges/create-meal/create-meal.component';
import {CreateRecipeComponent} from './_dialoges/create-recipe/create-recipe.component';
import {DeepCopyMealComponent} from './_dialoges/deep-copy-meal/deep-copy-meal.component';
import {DeleteCampComponent} from './_dialoges/delete-camp/delete-camp.component';
import {EditDayComponent} from './_dialoges/edit-day/edit-day.component';
import {ImportComponent} from './_dialoges/import/import.component';
import {MealInfoComponent} from './_dialoges/meal-info/meal-info.component';
import {MealPrepareComponent} from './_dialoges/meal-prepare/meal-prepare.component';
import {RecipeInfoComponent} from './_dialoges/recipe-info/recipe-info.component';
import {ShareDialogComponent} from './_dialoges/share-dialog/share-dialog.component';
import {AppSettingsPageComponent} from './_pages/app-settings-page/app-settings-page.component';
import {CampListPageComponent} from './_pages/_list-pages/camp-list-page/camp-list-page.component';
import {EditCampPageComponent} from './_pages/_edit-pages/edit-camp-page/edit-camp-page.component';
import {EditMealComponent} from './_pages/_edit-pages/edit-meal/edit-meal.component';
import {EditSingleRecipeComponent} from './_pages/_edit-pages/edit-single-recipe/edit-single-recipe.component';
import {ExportCampComponent} from './_pages/export-camp/export-camp.component';
import {MealListComponent} from './_pages/_list-pages/meal-list/meal-list.component';
import {RecipeListComponent} from './_pages/_list-pages/recipe-list/recipe-list.component';
import {WelcomPageComponent} from './_pages/welcom-page/welcom-page.component';
import {AuthenticationService} from './_service/authentication.service';
import {AutoSaveService} from './_service/auto-save.service';
import {DatabaseService} from './_service/database.service';
import {DownloadComponent} from './_template/download/download.component';
import {EditRecipeInCampComponent} from './_template/edit-recipe-in-camp/edit-recipe-in-camp.component';
import {IngredientFieldComponent} from './_template/ingredient-field/ingredient-field.component';
import {ListOfUsersComponent} from './_template/list-of-users/list-of-users.component';
import {DayOverviewComponent} from './_template/_overviews/day-overview/day-overview.component';
import {AddNewUserComponent} from './_template/add-new-user/add-new-user.component';
import {WeekOverviewComponent} from './_template/_overviews/week-overview/week-overview.component';
import {CopyRecipeComponent} from './_dialoges/copy-recipe/copy-recipe.component';
import {ListCardComponent} from './_template/list-card/list-card.component';
import {CopyCampComponent} from './_dialoges/copy-camp/copy-camp.component';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {MatSortModule} from '@angular/material/sort';
import {MatRadioModule} from '@angular/material/radio';
import {MarkdownModule} from 'ngx-markdown';
import {EditRecipeComponent} from './_template/edit-recipe/edit-recipe.component';
import {ContextMenuService} from './_service/context-menu.service';
import {ShortcutService} from './_service/shortcut.service';
import {HelpService} from './_service/help.service';
import {HelpComponent} from './_dialoges/help/help.component';
import {EditSingleMealComponent} from './_pages/_edit-pages/edit-single-meal/edit-single-meal.component';
import {SingleRecipeInfoComponent} from './_dialoges/single-recipe-info/single-recipe-info.component';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {FeedbackDialogComponent} from './_dialoges/feedback-dialog/feedback-dialog.component';
import {SettingsService} from './_service/settings.service';

@NgModule({
  declarations: [
    WelcomPageComponent,
    CampListPageComponent,

    EditCampPageComponent,
    AddNewUserComponent,
    DeleteCampComponent,
    EditDayComponent,
    WeekOverviewComponent,
    EditMealComponent,
    EditRecipeInCampComponent,
    IngredientFieldComponent,
    AddMealComponent,
    ExportCampComponent,
    ImportComponent,
    DayOverviewComponent,
    CreateMealComponent,
    ListOfUsersComponent,
    AppSettingsPageComponent,
    ExportCampComponent,
    DownloadComponent,
    ShareDialogComponent,
    FeedbackDialogComponent,
    CampInfoComponent,
    MealInfoComponent,
    RecipeInfoComponent,
    AddRecipeComponent,
    CreateRecipeComponent,
    MealPrepareComponent,
    RecipeListComponent,
    EditSingleRecipeComponent,
    MealListComponent,
    DeepCopyMealComponent,
    CreateCampComponent,
    CopyRecipeComponent,
    ListCardComponent,
    CopyCampComponent,
    EditRecipeComponent,
    HelpComponent,
    EditSingleMealComponent,
    SingleRecipeInfoComponent
  ],
  providers: [
    AngularFirestore,
    AngularFireAuth,
    AuthenticationService,
    DatabaseService,
    AutoSaveService,
    SwissDateAdapter,
    ContextMenuService,
    ShortcutService,
    HelpService,
    Location,
    SettingsService,
    {provide: FUNCTIONS_REGION, useValue: 'europe-west1'},
    {provide: DateAdapter, useClass: SwissDateAdapter},

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
    FormsModule,
    ReactiveFormsModule,

    MarkdownModule,
    MatProgressSpinnerModule
  ],

  entryComponents: [
    DeleteCampComponent,
    EditDayComponent,
    AddMealComponent,
    EditDayComponent,
    ImportComponent,
    CreateMealComponent,
    DeepCopyMealComponent,
    DayOverviewComponent,
    ShareDialogComponent,
    CampInfoComponent,
    MealInfoComponent,
    EditSingleMealComponent,
    SingleRecipeInfoComponent,
    RecipeInfoComponent,
    AddRecipeComponent,
    CreateRecipeComponent,
    CreateCampComponent,
    MealPrepareComponent,
    CopyRecipeComponent,
    CopyCampComponent,
    HelpComponent,
    FeedbackDialogComponent
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

  constructor(auth: AuthenticationService,
              contextMenu: ContextMenuService,
              shortCut: ShortcutService,
              helpService: HelpService,
              dialog: MatDialog) {

    // Test on first load
    auth.trackCredentials();

    // we want to use the contextMenuService in this module
    contextMenu.activate();
    shortCut.activate();

    helpService.addDialog(dialog);

  }

}
