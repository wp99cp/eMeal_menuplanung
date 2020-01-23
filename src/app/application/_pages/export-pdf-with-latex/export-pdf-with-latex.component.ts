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

  public exports: Observable<any[]>;

  constructor(private route: ActivatedRoute, private dbService: DatabaseService) {

    this.campId = this.route.url.pipe(map(url => url[1].path));
    this.exports = this.campId.pipe(mergeMap(campId => dbService.getExports(campId)));

    this.campId.pipe(mergeMap(campId => dbService.getCampById(campId))).subscribe(camp => this.setHeaderInfo(camp.name));

  }

  ngOnInit() {
  }

  pdf() {

    this.campId.subscribe(campId => this.dbService.createPDF(campId));



  }

  public toString(date) {

    return SettingsService.toStringMinutes(new Date(date.seconds * 1000));

  }

  /** setzt die HeaderInfos für die aktuelle Seite */
  private setHeaderInfo(campName): void {

    Header.title = 'Zusammenfassung ' + campName;
    Header.path = ['Startseite', 'meine Lager', campName, 'Zusammenfassung'];

  }

}
