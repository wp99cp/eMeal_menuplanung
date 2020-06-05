import {Component, OnInit, QueryList, ViewChildren} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Observable} from 'rxjs';
import {mergeMap, take, tap} from 'rxjs/operators';
import {HeaderNavComponent} from 'src/app/_template/header-nav/header-nav.component';

import {Camp} from '../../_class/camp';
import {CampInfoComponent} from '../../_dialoges/camp-info/camp-info.component';
import {ShareDialogComponent} from '../../_dialoges/share-dialog/share-dialog.component';
import {AutoSaveService, Saveable} from '../../_service/auto-save.service';
import {DatabaseService} from '../../_service/database.service';
import {WeekViewComponent} from '../../_template/week-view/week-view.component';
import {MatDialog} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';

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

  @ViewChildren(WeekViewComponent) weekViews: QueryList<WeekViewComponent>;

  // camp Data from server
  public camp: Observable<Camp>;

  constructor(
    private route: ActivatedRoute,
    private dbService: DatabaseService,
    private router: Router,
    public dialog: MatDialog,
    public snackBar: MatSnackBar,
    private autosave: AutoSaveService) {

    autosave.register(this);
    // Ladet das Lager von der URL
    this.camp = this.route.url.pipe(mergeMap(
      url => this.dbService.getCampById(url[1].path)
    )).pipe(tap(camp => camp.loadMeals(this.dbService))).pipe(take(1));

  }

  async ngOnInit() {

    // check for write access
    this.camp.subscribe(async camp => {
      const access = await this.dbService.canWrite(camp);
      if (access)
        HeaderNavComponent.turnOn('Mitarbeiter');
    });

    HeaderNavComponent.addToHeaderNav({
      active: true,
      description: 'Informationen zum Lager',
      name: 'Info',
      action: (() => this.campInfoDialog()),
      icon: 'info'
    });

    HeaderNavComponent.addToHeaderNav({
      active: false,
      description: 'Mitarbeiter verwalten',
      name: 'Mitarbeiter',
      action: (() => this.shareDialog()),
      icon: 'group_add'
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
          data: {camp}
        }).afterClosed()
      )).subscribe((camp) =>

      // TODO: upgrade rigths for all meals and recipes
      // if necessary...

      this.saveCamp(camp)
    );

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
