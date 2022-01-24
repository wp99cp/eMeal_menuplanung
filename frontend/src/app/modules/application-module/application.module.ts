import {DragDropModule} from '@angular/cdk/drag-drop';
import {CommonModule, Location} from '@angular/common';
import {NgModule} from '@angular/core';
import {AngularFireModule} from '@angular/fire/compat';
import {AngularFireAuth, AngularFireAuthModule} from '@angular/fire/compat/auth';
import {AngularFirestore, AngularFirestoreModule} from '@angular/fire/compat/firestore';
import {AngularFireFunctionsModule, REGION} from '@angular/fire/compat/functions';
import {AngularFireStorageModule} from '@angular/fire/compat/storage';
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
import {ApplicationRoutingModule} from './application-routing.module';
import {AddMealComponent} from './dialoges/add-meal/add-meal.component';
import {AddRecipeComponent} from './dialoges/add-recipe/add-recipe.component';
import {CampInfoComponent} from './dialoges/camp-info/camp-info.component';
import {CreateCampComponent} from './dialoges/create-camp/create-camp.component';
import {CreateMealComponent} from './dialoges/create-meal/create-meal.component';
import {CreateRecipeComponent} from './dialoges/create-recipe/create-recipe.component';
import {DeepCopyMealComponent} from './dialoges/deep-copy-meal/deep-copy-meal.component';
import {DeleteCampComponent} from './dialoges/delete-camp/delete-camp.component';
import {EditDayComponent} from './dialoges/edit-day/edit-day.component';
import {ImportComponent} from './dialoges/import/import.component';
import {MealInfoComponent} from './dialoges/meal-info/meal-info.component';
import {MealPrepareComponent} from './dialoges/meal-prepare/meal-prepare.component';
import {RecipeInfoComponent} from './dialoges/recipe-info/recipe-info.component';
import {ShareDialogComponent} from './dialoges/share-dialog/share-dialog.component';
import {AppSettingsPageComponent} from './pages/app-settings-page/app-settings-page.component';
import {CampListPageComponent} from './pages/camp-list-page/camp-list-page.component';
import {EditCampPageComponent} from './pages/edit-camp-page/edit-camp-page.component';
import {EditMealPageComponent} from './pages/edit-meal-page/edit-meal-page.component';
import {ExportCampPageComponent} from './pages/export-camp-page/export-camp-page.component';
import {MealListPageComponent} from './pages/meal-list-page/meal-list-page.component';
import {RecipeListPageComponent} from './pages/recipe-list-page/recipe-list-page.component';
import {WelcomPageComponent} from './pages/welcom-page/welcom-page.component';
import {AuthenticationService} from './services/authentication.service';
import {AutoSaveService} from './services/auto-save.service';
import {DatabaseService} from './services/database.service';
import {EditRecipeInCampComponent} from './components/edit-recipe-in-camp/edit-recipe-in-camp.component';
import {IngredientFieldComponent} from './components/ingredient-field/ingredient-field.component';
import {ListOfUsersComponent} from './components/list-of-users/list-of-users.component';
import {DayOverviewComponent} from './components/day-overview/day-overview.component';
import {AddNewUserComponent} from './components/add-new-user/add-new-user.component';
import {WeekOverviewComponent} from './components/week-overview/week-overview.component';
import {CopyRecipeComponent} from './dialoges/copy-recipe/copy-recipe.component';
import {ListCardComponent} from './components/list-card/list-card.component';
import {CopyCampComponent} from './dialoges/copy-camp/copy-camp.component';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {MatSortModule} from '@angular/material/sort';
import {MatRadioModule} from '@angular/material/radio';
import {MarkdownModule} from 'ngx-markdown';
import {EditRecipeComponent} from './components/edit-recipe/edit-recipe.component';
import {ContextMenuService} from './services/context-menu.service';
import {ShortcutService} from './services/shortcut.service';
import {HelpService} from './services/help.service';
import {HelpComponent} from './dialoges/help/help.component';
import {EditSingleMealPageComponent} from './pages/edit-single-meal-page/edit-single-meal-page.component';
import {SingleRecipeInfoComponent} from './dialoges/single-recipe-info/single-recipe-info.component';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {FeedbackDialogComponent} from './dialoges/feedback-dialog/feedback-dialog.component';
import {SettingsService} from './services/settings.service';
import {ExportSettingsComponent} from './dialoges/export-settings/export-settings.component';
import {ChangeLogComponent} from './dialoges/change-log/change-log.component';
import {MealInfoWithoutCampComponent} from './dialoges/meal-info-without-camp/meal-info-without-camp.component';
import {NewListElementComponent} from './components/new-list-element/new-list-element.component';
import {ImportIngredientsComponent} from './dialoges/import-ingredients/import-ingredients.component';
import {MatSelectModule} from "@angular/material/select";
import {MatChipsModule} from "@angular/material/chips";
import {SwissDateAdapter} from "../../shared/utils/format-datapicker";
import {VersionHistoryModule} from "../change-log-module/version-history.module";
import {DownloadModule} from "../download-module/download.module";
import buildInfo from '../../../build';
import {EditSingleRecipePageComponent} from "./pages/edit-single-recipe-page/edit-single-recipe-page.component";

@NgModule({
  declarations: [
    WelcomPageComponent,
    CampListPageComponent,
    EditCampPageComponent,
    AddNewUserComponent,
    DeleteCampComponent,
    EditDayComponent,
    WeekOverviewComponent,
    EditMealPageComponent,
    EditRecipeInCampComponent,
    IngredientFieldComponent,
    AddMealComponent,
    ExportCampPageComponent,
    ImportComponent,
    DayOverviewComponent,
    CreateMealComponent,
    ListOfUsersComponent,
    AppSettingsPageComponent,
    ExportCampPageComponent,
    ShareDialogComponent,
    FeedbackDialogComponent,
    CampInfoComponent,
    MealInfoComponent,
    RecipeInfoComponent,
    AddRecipeComponent,
    CreateRecipeComponent,
    MealPrepareComponent,
    RecipeListPageComponent,
    EditSingleRecipePageComponent,
    MealListPageComponent,
    DeepCopyMealComponent,
    CreateCampComponent,
    CopyRecipeComponent,
    ListCardComponent,
    CopyCampComponent,
    EditRecipeComponent,
    HelpComponent,
    EditSingleMealPageComponent,
    SingleRecipeInfoComponent,
    ExportSettingsComponent,
    ChangeLogComponent,
    MealInfoWithoutCampComponent,
    NewListElementComponent,
    ImportIngredientsComponent,
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
    AngularFirestoreModule,
    {provide: REGION, useValue: 'europe-west1'},
    {provide: DateAdapter, useClass: SwissDateAdapter},
  ],
  imports: [
    CommonModule,
    ApplicationRoutingModule,
    AngularFireModule.initializeApp(environment.firebaseConfig, 'eMeal - Menüplanung'),
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
    DownloadModule,
    MarkdownModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatChipsModule
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

  constructor(contextMenu: ContextMenuService,
              shortCut: ShortcutService,
              helpService: HelpService,
              dialog: MatDialog,
              settings: SettingsService) {


    // we want to use the contextMenuService in this module
    contextMenu.activate();
    shortCut.activate();

    helpService.addDialog(dialog);

    settings.globalSettings.subscribe(s => {

      if (s.last_shown_changelog !== buildInfo.version) {

        dialog.open(ChangeLogComponent, {
          height: '618px',
          width: '1000px'
        }).afterClosed()
          .subscribe(() => settings.setLastShownChangelog(buildInfo.version));

      }

    });


  }

}
