import {Component, OnInit, QueryList, ViewChildren} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Observable} from 'rxjs';
import {first, mergeMap, take, tap} from 'rxjs/operators';
import {HeaderNavComponent} from 'src/app/_template/header-nav/header-nav.component';

import {Camp} from '../../../_class/camp';
import {CampInfoComponent} from '../../../_dialoges/camp-info/camp-info.component';
import {ShareDialogComponent} from '../../../_dialoges/share-dialog/share-dialog.component';
import {AutoSaveService, Saveable} from '../../../_service/auto-save.service';
import {DatabaseService} from '../../../_service/database.service';
import {WeekOverviewComponent} from '../../../_template/_overviews/week-overview/week-overview.component';
import {MatDialog} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';
import {HelpService} from '../../../_service/help.service';
import {CurrentlyUsedMealService} from '../../../../_template/currently-used-meal.service';

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
  public errorOnLoad = false;

  constructor(
    private route: ActivatedRoute,
    private dbService: DatabaseService,
    private router: Router,
    public dialog: MatDialog,
    public snackBar: MatSnackBar,
    private autosave: AutoSaveService,
    private helpService: HelpService,
    private lastUsedService: CurrentlyUsedMealService) {

    helpService.addHelpMessage({
      title: 'Neue Mahlzeiten erstellen',
      message: `Falls die Suche nach einer Mahlzeit keinen Treffer ergab, so kannst du mit einem
                einfachen Klick auf "Mahlzeit erstellen" direkt eine Mahlzeit mit dem gewünschten
                Namen erfassen und erstellen. <br>
                <br>
                <img width="100%" src="/assets/img/help_info_messages/Create_Meal.png">`,
      url: router.url
    });

    helpService.addHelpMessage({
      title: 'Lager freigeben und gemeinsam bearbeiten.',
      message: `Lager können mit anderen Nutzern von eMeal-Menüplanung geteilt werden.
                Dabei kannst du eine Lager mit den folgenden Berechtigungen teilen.<br>
                <ul>
                    <li><b>Besitzer:</b> Diese Rolle hat derjenige, der das Lager erstellt hat. Der Besitzer hat
                    Administrator-Rechte für jede Mahlzeit und jedes Rezept in diesem Lager.</li>
                    <li><b>Administrator:</b> Kann jede Mahlzeit bearbeiten (Zutaten ändern, hinzufügen oder löschen) und
                     alle in seinen eigenen Lagern verwenden. Änderungen an Rezepten/Mahlzeiten
                     werden auch in andere Lager übernommen. <i>Beispiel: Rezept A wird in Lager 1 bearbeitet.
                     Wird Rezept 1 in Lager 2 ebenfalls verwendet, so werden die Zutaten in Lager 2 ebenfalls geändert.</i>
                     </li>
                     <li><b>Mitarbeiter:</b> (Noch nicht verfügbar) Kann jede Mahlzeit bearbeiten (Zutaten ändern, hinzufügen oder löschen),
                     dabei werden die Änderungen aber nur lokal in diesem Lager gespeichert. Ein Mitarbeiter hat somit
                     keinen Zugriff auf die Vorlagen der Lager/Rezepte.
                     </li>
                     <li><b>Leser:</b> Kann die Mahlzeit und die Rezepte in diesem Lager betrachten.
                     Kann eine eigene Kopie erstellen und diese anschliessend bearbeiten.</li>
                </ul>`,
      url: router.url,
      ref: 'camp-authorization-infos'
    });


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
      name: 'Info',
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
