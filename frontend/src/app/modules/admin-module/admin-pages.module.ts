import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule} from '@angular/forms';

import { AdminPagesRoutingModule } from './admin-pages-routing.module';
import { AdminDashboardComponent } from './pages/admin-dashboard/admin-dashboard.component';
import { FeedbackMessageOverviewComponent } from './components/feedback-message-overview/feedback-message-overview.component';
import {MatTabsModule} from '@angular/material/tabs';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from "@angular/material/icon";
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {MatTooltipModule} from '@angular/material/tooltip';
import { FoodCategoriesComponent } from './components/food-categories/food-categories.component';
import {AdminStatusComponent} from './components/admin-status/admin-status.component';
import {HelpMessageEditorComponent} from './components/help-message-editor/help-message-editor.component';
import {UserLookupComponent} from './components/user-lookup/user-lookup.component';


@NgModule({
  declarations: [
    AdminDashboardComponent,
    AdminStatusComponent,
    FeedbackMessageOverviewComponent,
    FoodCategoriesComponent,
    HelpMessageEditorComponent,
    UserLookupComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    AdminPagesRoutingModule,
    MatTabsModule,
    MatExpansionModule,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressBarModule,
    MatSnackBarModule,
    MatTooltipModule
  ]
})
export class AdminPagesModule { }
