import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
import { TemplateHeaderComponent as Header } from 'src/app/_template/template-header/template-header.component';

import { DatabaseService } from '../../_service/database.service';
import { SettingsService } from '../../_service/settings.service';

@Component({
  selector: 'app-export-pdf-with-latex',
  templateUrl: './export-pdf-with-latex.component.html',
  styleUrls: ['./export-pdf-with-latex.component.sass']
})
export class ExportPdfWithLatexComponent implements OnInit {

  private campId: Observable<string>;

  public pending = false;
  public exports: Observable<any[]>;
  public message: string;

  constructor(private route: ActivatedRoute, private dbService: DatabaseService) {

    this.campId = this.route.url.pipe(map(url => url[1].path));
    this.exports = this.campId.pipe(mergeMap(campId => dbService.getExports(campId)));
    this.exports.subscribe(console.log);

    this.campId.pipe(mergeMap(campId => dbService.getCampById(campId))).subscribe(camp => this.setHeaderInfo(camp.name));

  }

  ngOnInit() {
  }

  /**
   * Request a PDF export of the camp
   */
  createPDF() {

    this.pending = true;
    this.campId
      .pipe(mergeMap(campId => this.dbService.createPDF(campId)))
      .subscribe(() => { this.pending = false; },

        // bug report on error
        (err) => {

          this.pending = false;
          this.message = 'Beim Export ist ein unerwarteter Fehler aufgetreten! Bitte versuches später erneut.';
          this.campId.subscribe(campId =>
            this.dbService.addFeedback({
              title: 'Fehler beim Export',
              feedback: `Das exportieren eines Lagers (` + campId + `) ist fehlgeschlagen!
            Dies ist eine automatische Fehlermeldung des Systems. Zeitpunkt: ` + new Date().toUTCString()
            }));

        });

  }

  public getDate(date: any) {

    return new Date(date.seconds * 1000);

  }

  /** setzt die HeaderInfos für die aktuelle Seite */
  private setHeaderInfo(campName): void {

    Header.title = 'Zusammenfassung ' + campName;
    Header.path = ['Startseite', 'meine Lager', campName, 'Zusammenfassung'];

  }

}
