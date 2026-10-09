import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {TemplateHeaderComponent as Header} from '../../../../shared/components/template-header/template-header.component';
import {AdminService} from '../../services/admin.service';

/** The tabs in their order, the name is used in the query parameter "tab". */
const TABS = ['status', 'feedback', 'shopping-list', 'help', 'users'];

@Component({
  standalone: false,
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.sass']
})
export class AdminDashboardComponent implements OnInit {

  public selectedTab: Observable<number>;
  public openFeedback: Observable<number>;
  // ingredients and corrections that wait for a decision
  public openShoppingList: Observable<number>;

  constructor(private route: ActivatedRoute,
              private router: Router,
              private admin: AdminService) {
  }

  ngOnInit(): void {

    Header.title = 'Admin Dashboard';
    Header.path = ['Startseite', 'Admin Dashboard'];

    // the tab is part of the URL, so a tab can be linked
    this.selectedTab = this.route.queryParamMap.pipe(map(params => Math.max(TABS.indexOf(params.get('tab')), 0)));

    this.openFeedback = this.admin.countOpenFeedbackMessages();
    this.openShoppingList = this.admin.getFoodCategories()
      .pipe(map(food => food.uncategorised.length + food.resentCorrections.length));

  }

  selectTab(index: number) {
    this.router.navigate([], {relativeTo: this.route, queryParams: {tab: TABS[index]}, replaceUrl: true});
  }

}
