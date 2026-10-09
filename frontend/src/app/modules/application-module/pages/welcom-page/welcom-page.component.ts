import {Component, OnInit} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {Router} from '@angular/router';
import {Observable} from 'rxjs';
import {filter, map, mergeMap, take} from 'rxjs/operators';
import {TemplateHeaderComponent as Header} from '../../../../shared/components/template-header/template-header.component';
import {Camp} from '../../classes/camp';
import {CreateCampComponent} from '../../dialoges/create-camp/create-camp.component';
import {FirestoreCamp} from '../../interfaces/firestoreDatatypes';
import {DatabaseService} from '../../services/database.service';
import {HelpService} from '../../services/help.service';

/**
 * WelcomPage of the eMeal appliction after signed in.
 * Shows the next step: new users create their first camp, the others continue with a recently edited camp.
 */
@Component({
  standalone: false,
  selector: 'app-welcom-page',
  templateUrl: './welcom-page.component.html',
  styleUrls: ['./welcom-page.component.sass']
})
export class WelcomPageComponent implements OnInit {

  public readonly maxRecentCamps = 3;

  /** the camps of the user, the most recently edited first */
  public camps: Observable<Camp[]>;

  constructor(public help: HelpService,
              private dbService: DatabaseService,
              private dialog: MatDialog,
              private router: Router) {
  }

  ngOnInit() {

    this.camps = this.dbService.getCampsWithAccess()
      .pipe(map(camps => [...camps].sort((a, b) => b.lastChange.getTime() - a.lastChange.getTime())));

    this.setHeaderInfo();

  }

  weekday(date: Date): string {
    return ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'][date.getDay()];
  }

  /** Opens the dialog to create a camp, the new camp gets opened afterwards */
  createCamp() {

    this.dialog.open(CreateCampComponent, {
      height: '640px',
      width: '900px',
      data: {campName: ''}
    }).afterClosed()
      .pipe(
        // the dialog got cancelled
        filter(camp => !!camp),
        mergeMap((camp: Observable<FirestoreCamp>) => camp),
        take(1))
      .subscribe(campData =>
        this.dbService.addDocument(campData, 'camps').then(res =>
          this.router.navigateByUrl('/app/camps/' + res.id)));

  }

  /** setzt die HeaderInfos für die aktuelle Seite */
  private setHeaderInfo(): void {
    Header.title = 'Lagerplanen leicht gemacht!';
    Header.path = [];

  }

}
