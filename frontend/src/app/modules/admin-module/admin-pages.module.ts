import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminPagesRoutingModule } from './admin-pages-routing.module';
import { AdminDashboardComponent } from './pages/admin-dashboard/admin-dashboard.component';
import { FeedbackMessageOverviewComponent } from './components/feedback-message-overview/feedback-message-overview.component';
import {MatTabsModule} from '@angular/material/tabs';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from "@angular/material/icon";
import { FoodCategoriesComponent } from './components/food-categories/food-categories.component';


@NgModule({
  declarations: [
    AdminDashboardComponent,
    FeedbackMessageOverviewComponent,
    FoodCategoriesComponent
  ],
  imports: [
    CommonModule,
    AdminPagesRoutingModule,
    MatTabsModule,
    MatExpansionModule,
    MatButtonModule,
    MatIconModule
  ]
})
export class AdminPagesModule { }
