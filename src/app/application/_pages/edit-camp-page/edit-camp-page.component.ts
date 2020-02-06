import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { MatDialog, MatSnackBar } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { mergeMap, take, map } from 'rxjs/operators';
import { HeaderNavComponent } from 'src/app/_template/header-nav/header-nav.component';

import { Camp } from '../../_class/camp';
import { CampInfoComponent } from '../../_dialoges/camp-info/camp-info.component';
import { ShareDialogComponent } from '../../_dialoges/share-dialog/share-dialog.component';
import { Saveable } from '../../_service/auto-save.service';
import { DatabaseService } from '../../_service/database.service';
import { WeekViewComponent } from '../../_template/week-view/week-view.component';

@Component({
  selector: 'app-edit-camp-page',
  templateUrl: './edit-camp-page.component.html',
  styleUrls: ['./edit-camp-page.component.sass']
})
export class EditCampPageComponent implements OnInit, Saveable {

  @ViewChildren(WeekViewComponent) weekViews: QueryList<WeekViewComponent>;

  // camp Data from server
  public camp: Observable<Camp>;

  constructor(
    private route: ActivatedRoute,
    private databaseService: DatabaseService,
    private router: Router,
    public dialog: MatDialog,
    public snackBar: MatSnackBar) {

    // Ladet das Lager von der URL
    this.camp = this.route.url.pipe(mergeMap(
      url => this.databaseService.getCampById(url[1].path)
    ));

  }

  ngOnInit() {

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
      action: (() => this.router.navigate(['export'], { relativeTo: this.route })),
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
   */
  public campInfoDialog() {

    // Takes the unsaved changes form the weekview and puts the
    // changes from the dialog on top of this...
    this.weekViews.first.saveCamp().pipe(mergeMap(camp =>

      // Dialog öffnen
      this.dialog.open(CampInfoComponent, {
        height: '618px',
        width: '1000px',
        data: { camp }
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
          data: { camp }
        }).afterClosed()

      )).subscribe((camp) =>
        this.saveCamp(camp)
      );

  }

  /**
   * Save the camp
   *
   */
  public saveCamp(camp: Camp) {

    this.snackBar.open('Änderungen wurden erfolgreich gespeichert!', '', { duration: 2000 });
    this.databaseService.updateDocument(camp);

  }

}
