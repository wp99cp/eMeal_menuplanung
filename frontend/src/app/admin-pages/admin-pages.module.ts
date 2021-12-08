import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminPagesRoutingModule } from './admin-pages-routing.module';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { HelpMessageOverviewComponent } from './admin-dashboard/help-message-overview/help-message-overview.component';
import {MatTabsModule} from '@angular/material/tabs';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from "@angular/material/icon";


@NgModule({
  declarations: [
    AdminDashboardComponent,
    HelpMessageOverviewComponent
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
