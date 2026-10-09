import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Subscription} from 'rxjs';
import {distinctUntilChanged, map} from 'rxjs/operators';
import {AdminService, UserLookupResult} from '../../services/admin.service';

const MIN_QUERY_LENGTH = 3;

const ROLES = {owner: 'Besitzer', editor: 'Administrator', collaborator: 'Mitarbeiter', viewer: 'Leser'};
const PROVIDERS = {password: 'Passwort', 'google.com': 'Google'};

@Component({
  standalone: false,
  selector: 'app-user-lookup',
  templateUrl: './user-lookup.component.html',
  styleUrls: ['./user-lookup.component.sass']
})
export class UserLookupComponent implements OnInit, OnDestroy {

  public query = '';
  public searching = false;
  public failed = false;

  // undefined as long as nothing was searched
  public users: UserLookupResult[] | undefined;

  private queryParam: Subscription;

  constructor(private admin: AdminService,
              private route: ActivatedRoute,
              private router: Router) {
  }

  ngOnInit(): void {

    // the search term is part of the URL, e.g. a feedback message links to its sender
    this.queryParam = this.route.queryParamMap
      .pipe(map(params => params.get('q') ?? ''), distinctUntilChanged())
      .subscribe(query => {
        this.query = query;
        this.find(query);
      });

  }

  ngOnDestroy(): void {
    this.queryParam.unsubscribe();
  }

  canSearch(): boolean {
    return this.query.trim().length >= MIN_QUERY_LENGTH;
  }

  search() {

    if (!this.canSearch()) {
      return;
    }

    const query = this.query.trim();

    // the same term again: the URL does not change
    if (query === this.route.snapshot.queryParamMap.get('q')) {
      this.find(query);
      return;
    }

    this.router.navigate([], {relativeTo: this.route, queryParams: {tab: 'users', q: query}});

  }

  role(role: string): string {
    return ROLES[role] ?? role;
  }

  providers(user: UserLookupResult): string {

    // the accounts of the Cevi.DB are created with a custom token, they have no provider
    if (user.created !== null && user.providers.length === 0) {
      return 'Cevi.DB';
    }

    return user.providers.map(provider => PROVIDERS[provider] ?? provider).join(', ');

  }

  private async find(query: string) {

    if (query.length < MIN_QUERY_LENGTH) {
      this.users = undefined;
      return;
    }

    this.searching = true;
    this.failed = false;

    try {
      const users = await this.admin.findUsers(query);
      // a newer search may have been started in the meantime
      if (query === this.query.trim()) {
        this.users = users;
      }
    } catch (error) {
      console.error(error);
      this.users = undefined;
      this.failed = true;
    }

    this.searching = false;

  }

}
