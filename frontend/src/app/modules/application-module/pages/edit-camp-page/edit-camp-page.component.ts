import {Component, OnInit, QueryList, ViewChildren} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Observable} from 'rxjs';
import {filter, mergeMap, take, tap} from 'rxjs/operators';

import {Camp} from '../../classes/camp';
import {CampInfoComponent} from '../../dialoges/camp-info/camp-info.component';
import {ShareDialogComponent} from '../../dialoges/share-dialog/share-dialog.component';
import {AutoSaveService, Saveable} from '../../services/auto-save.service';
import {DatabaseService} from '../../services/database.service';
import {WeekOverviewComponent} from '../../components/week-overview/week-overview.component';
import {MatDialog} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';
import {CurrentlyUsedMealService} from "../../../../services/currently-used-meal.service";
import {HeaderNavComponent} from "../../../../shared/components/header-nav/header-nav.component";

@Component({
  selector: 'app-edit-camp-page',
  templateUrl: './edit-camp-page.component.html',
  styleUrls: ['./edit-camp-page.component.sass']
})
export class EditCampPageComponent implements OnInit, Saveable {

  // TODO: neue Funktion erstellen: 'automatisch Zusammenstellen'
  // diese Funktion erstellt automatisch eine Wochenübersicht
  // basierend auf deinen Rezepten und Mahlzeiten und dem
  // verwendungszweck in den vergangenen Lagern.
  // schaut darauf, dass Beilagen nicht zweimal pro Tag verwendet werden
  // und auch nicht am vorherigen oder nächsten und schaut
  // das nur einmal pro Tag Fleisch verwendet wird.

  @ViewChildren(WeekOverviewComponent) weekViews: QueryList<WeekOverviewComponent>;

  // camp Data from server
  public camp: Observable<Camp>;
  public campAngular: Observable<Camp>;

  public errorOnLoad = false;
  private oldCamp: Camp;

  constructor(
    private route: ActivatedRoute,
    private dbService: DatabaseService,
    private router: Router,
    public dialog: MatDialog,
    public snackBar: MatSnackBar,
    private autosave: AutoSaveService,
    private lastUsedService: CurrentlyUsedMealService) {

    autosave.register(this);

    // Ladet das Lager von der URL
    this.camp = this.route.url.pipe(
      mergeMap(url => this.dbService.getCampById(url[1].path)),
      tap(camp => camp.loadMeals(this.dbService))
    );

    this.camp.subscribe(() => {
    }, err => {
      this.errorOnLoad = true;
    });

    this.campAngular = this.camp.pipe(
      filter(camp => !this.oldCamp?.isEqual(camp)),
      tap(camp => {
        this.oldCamp = camp;
      })
    );

  }

  async ngOnInit() {

    // check for write access
    this.camp.subscribe(async camp => {
      const access = await this.dbService.canWrite(camp);
      if (access) {
        HeaderNavComponent.turnOn('Mitarbeiter');
      }
    });

    // set as last used
    this.camp
      .subscribe(camp =>
        this.lastUsedService.addToHistory(camp)
      );

    HeaderNavComponent.addToHeaderNav({
      active: true,
      description: 'Informationen zum Lager',
      name: 'Lager Info',
      action: (() => this.campInfoDialog()),
      icon: 'info'
    });

    HeaderNavComponent.addToHeaderNav({
      active: true,
      description: 'Lager freigeben',
      name: 'Teilen',
      action: (() => this.shareDialog()),
      icon: 'share'
    });

    HeaderNavComponent.addToHeaderNav({
      active: true,
      description: 'Lager exportieren',
      name: 'Export',
      action: (() => this.router.navigate(['export'], {relativeTo: this.route})),
      icon: 'cloud_download',
      separatorAfter: true
    });

  }


  public async save(): Promise<boolean> {

    let saved = false;

    // Das Lager selbst hat keine Änderunge zu speichern
    // Aber in der Wochenübersicht können offene
    // Änderungen bestehen

    // Speichert die Wochenübersicht
    this.weekViews.forEach(async weekView => {
      saved = await weekView.save();
    });

    return saved;

  }


  /**
   * Opens the dialog for the camp infos
   *
   * TODO: Im Moment wird das Lager hiermit zweimal gespeichert!
   *
   */
  public campInfoDialog() {

    this.save();

    // Takes the unsaved changes form the weekview and puts the
    // changes from the dialog on top of this...
    this.weekViews.first.saveCamp().pipe(mergeMap(camp =>

      // Dialog öffnen
      this.dialog.open(CampInfoComponent, {
        height: '618px',
        width: '1000px',
        data: {camp}
      }).afterClosed()
    )).subscribe((camp: Camp | null) => {

      // Speichern der Änderungen im Dialog-Fenster
      if (camp !== null && camp !== undefined) {
        this.saveCamp(camp);
      }

    });

  }


  /**
   * Öffnet den Share-Dialog für das Lager
   *
   */
  public shareDialog() {

    this.camp.pipe(take(1))
      .pipe(mergeMap(camp =>
        this.dialog.open(ShareDialogComponent, {
          height: '618px',
          width: '1000px',
          data: {
            objectName: 'Lager',
            currentAccess: camp.getAccessData(),
            documentPath: camp.path,
            helpMessageId: 'camp-authorization-infos',
            accessLevels: ['editor', 'viewer'] // ['editor', 'viewer', 'collaborator']
          }
        }).afterClosed())).subscribe();

  }

  /**
   * Save the camp
   *
   */
  public saveCamp(camp: Camp) {

    this.snackBar.open('Änderungen wurden erfolgreich gespeichert!', '', {duration: 2000});
    this.dbService.updateDocument(camp);

  }

}
