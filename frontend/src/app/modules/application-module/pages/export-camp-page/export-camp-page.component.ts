import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Observable} from 'rxjs';
import {map, mergeMap, take, tap} from 'rxjs/operators';

import {DatabaseService} from '../../services/database.service';
import {HelpService} from '../../services/help.service';
import {MatDialog} from '@angular/material/dialog';
import {ExportSettingsComponent} from '../../dialoges/export-settings/export-settings.component';
import {HeaderNavComponent} from "../../../../shared/components/header-nav/header-nav.component";
import {SwissDateAdapter} from "../../../../shared/utils/format-datapicker";

@Component({
  selector: 'app-export-camp-page',
  templateUrl: './export-camp-page.component.html',
  styleUrls: ['./export-camp-page.component.sass']
})
export class ExportCampPageComponent implements OnInit {

  public pending = false;
  public exports: Observable<any[]>;
  public message: string;
  public showExports = true;
  public exportIsRunning = false;
  private campId: Observable<string>;

  constructor(private route: ActivatedRoute,
              private dbService: DatabaseService,
              private router: Router,
              public swissDateAdapter: SwissDateAdapter,
              public helpService: HelpService,
              private dialog: MatDialog) {

    this.campId = this.route.url.pipe(map(url => url[1].path));
    this.exports = this.campId.pipe(mergeMap(campId => dbService.getExports(campId)));
    this.exports.subscribe(() => {
        this.pending = false;
      }
    );

  }

  ngOnInit() {

    this.campId.pipe(mergeMap(id => this.dbService.getCampById(id)))
      .pipe(take(1))
      .subscribe(camp =>
        HeaderNavComponent.addToHeaderNav({
          active: true,
          description: 'Zurück zum ' + camp.name,
          name: camp.name,
          action: (() => this.router.navigate(['..'], {relativeTo: this.route})),
          separatorAfter: true
        }, 0)
      );


    HeaderNavComponent.addToHeaderNav({
      active: true,
      description: 'Lager erneut exportieren',
      name: 'Neuer Export',
      action: (() => this.createNewExport()),
      icon: 'create_new_folder'
    });

    HeaderNavComponent.addToHeaderNav({
      active: true,
      description: 'Löscht alle Exporte des Lagers',
      name: 'Exporte löschen',
      action: (() => this.deleteExports()),
      icon: 'delete'
    });


  }


  deleteExports() {

    // reset gui
    this.showExports = false;
    this.campId.subscribe(campId => this.dbService.deleteExports(campId));

  }

  /**
   * Request a PDF export of the camp
   */
  createNewExport() {

    this.campId.pipe(mergeMap(campId =>
      this.dialog.open(ExportSettingsComponent, {
        height: '618px',
        width: '1000px',
        data: campId
      }).afterClosed()))
      .pipe(tap(() => {
        this.showExports = true;
        this.exportIsRunning = true;
        this.pending = true;
        this.message = '';
      }))
      .pipe(mergeMap(result => {

        if (result.legacy) {
          return this.dbService.legacyPDFCreation(result.campId);
        }
        return this.dbService.createPDF(result.campId, result.optionalArgs);

      }))
      .subscribe(() => {
        this.exportIsRunning = false;
      }, (err) => {

        if (String(err).includes('TypeError')) {
          console.log('Export Aborted!');
        } else {
          this.message = 'Beim Export ist ein unerwarteter Fehler aufgetreten! Bitte versuches später erneut.';
        }

        this.pending = false;

      });

  }

  public getDate(date: any) {

    return new Date(date.seconds * 1000);

  }


}
