import { Component, OnInit } from '@angular/core';
import { Data, Router, RoutesRecognized, ActivationEnd, ActivatedRoute, NavigationEnd } from '@angular/router';
import { Observable } from 'rxjs';
import { filter, map, mergeMap } from 'rxjs/operators';


@Component({
  selector: 'app-template-header',
  templateUrl: './template-header.component.html',
  styleUrls: ['./template-header.component.sass']
})
export class TemplateHeaderComponent implements OnInit {

  protected path: Observable<string[]>;

  private defaultTitle = 'Menuplanung für Lager';

  constructor(router: Router, activatedRoute: ActivatedRoute) {
    this.path = router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      map(() => activatedRoute),
      map(route => {
        while (route.firstChild) {
          route = route.firstChild;
        }
        return route;
      }),
      mergeMap(route => route.data),
      map(data => data.hasOwnProperty('path') ? data.path : [])

    );
  }

  ngOnInit(): void {

  }

}


