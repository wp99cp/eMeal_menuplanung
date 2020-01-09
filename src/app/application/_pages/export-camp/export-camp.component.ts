import { Component, OnInit, ViewChild } from '@angular/core';
import { Observable, of } from 'rxjs';
import { User } from '../../_interfaces/user';
import { AuthenticationService } from '../../_service/authentication.service';
import { DatabaseService } from '../../_service/database.service';
import { MatAccordion } from '@angular/material/expansion';
import { ActivatedRoute } from '@angular/router';
import { map, flatMap, mergeMap } from 'rxjs/operators';
import { TemplateHeaderComponent as Header } from 'src/app/_template/template-header/template-header.component';
import { SettingsService } from '../../_service/settings.service';

/** ExportCampComponent:
 * Export Seite für Lager. Möglichkeit ein in eMeal erstelltes Lager als
 * PDF zu exportieren. Der Export funktioniert über die Druckfunktion des
 * Browsers (z.B. Chrome).
 *
 * Hierzu wird eine HTML Seite generiert, jed <h1>-Überschrift wird beim
 * Drucken automatisch auf eine neue Seite gesetzt. So entsteht das Lager-
 * Dossier.
 *
 * Die Daten fürs Lagerdossier werden von einer cloud function zusammengestellt
 * und in mehreren Teilen abgeholt.
 *
 * Bestandteile:
 *
 * - shoppingList: Einkaufsliste mit allen Zutaten, Mengenangaben und Masseinheiten.
 * Soriert nach food categories.
 *
 * - campInfo: Informationen zum aktuellen Lager. Enthält die Wochenübersicht, sowie
 * sämtliche allgemeine Daten.
 *
 * - mealsInfo: Liste sämtlicher Meal inkl. allen Rezeptdaten. Enthält Zutaten, Notizen
 * Personenanzahl und Rezeptangaben zu den Mahlzeiten.
 */
@Component({
  selector: 'app-export-camp',
  templateUrl: './export-camp.component.html',
  styleUrls: ['./export-camp.component.sass']
})
export class ExportCampComponent implements OnInit {

  @ViewChild('accordion', { static: false }) Accordion: MatAccordion;

  private campId: Observable<string>;

  public displayedColumns: string[] = ['measure', 'unit', 'food'];
  public today: string;
  public user: Observable<User>;
  public shoppingListWithError: Observable<any>;
  public campInfo: Observable<any>;
  public weekTable: Observable<any>;
  public mealsInfo: Observable<any>;
  public weekViewErrorMessage = '';

  constructor(private route: ActivatedRoute, private authService: AuthenticationService, private databaseService: DatabaseService) {

    this.today = SettingsService.toString(new Date());

  }

  ngOnInit() {


    // load campId from url
    this.campId = this.route.url.pipe(map(url => url[1].path));

    // set header info
    this.campId.pipe(mergeMap(id => this.databaseService.getCampById(id))).subscribe(camp => this.setHeaderInfo(camp.name));

    // ladet den aktuellen Nutzer
    this.user = this.authService.getCurrentUser();

    // ladet die Infos für den Export und passt sie ggf. an
    this.shoppingListWithError = this.campId.pipe(flatMap(campId => this.databaseService.getShoppingList(campId)));
    this.campInfo = this.campId.pipe(flatMap(campId => this.databaseService.getCampInfoExport(campId)));
    this.mealsInfo = this.databaseService.getMealsInfoExport();
    this.weekTable = this.campInfo.pipe(map(this.transformToWeekTable()));

    // print der geladenen Daten auf der Console
    this.shoppingListWithError.subscribe(console.log);
    this.campInfo.subscribe(console.log);
    this.weekTable.subscribe(console.log);
    this.mealsInfo.subscribe(console.log);

  }

  /** Druckt die aktuelle Seite (mit der Druckfunktion des Browsers). */
  async print() {

    window.print();

  }


  /** setzt die HeaderInfos für die aktuelle Seite */
  private setHeaderInfo(campName): void {

    Header.title = 'Zusammenfassung ' + campName;
    Header.path = ['Startseite', 'meine Lager', campName, 'Zusammenfassung'];

  }


  /** Passt die CampExport Daten so an, dass daraus eine Wochenübersichtstabelle generiert werden kann */
  private transformToWeekTable(): (campInfo: any) => any {

    // löscht frühere Fehlermeldungen
    this.weekViewErrorMessage = '';

    return campInfo => {

      const days = campInfo.data.days;

      // sortieren nach Datum
      interface WithDate { date: number; }
      days.sort((a: WithDate, b: WithDate) => a.date - b.date);

      const tableHeaders = [];

      interface HashTable { [key: string]: string[]; }
      const rows: HashTable = {};

      days.forEach((day: { date: any; meals: [{ title: string; description: string; }]; }) => {

        // converts datum to local date string
        tableHeaders.push(SettingsService.toString(new Date(day.date._seconds * 1000)));

        // sort meals
        day.meals.sort((a, b) => a.title.localeCompare(b.title));

        // add meals of day
        day.meals.forEach(meal => {


          if (rows[meal.title] === undefined) {

            rows[meal.title] = [];
            for (let i = 0; i < tableHeaders.length - 1; i++) {
              rows[meal.title].push('-');
            }


          } else if (rows[meal.title].length === tableHeaders.length) {

            this.weekViewErrorMessage = 'Wochenplan kann nicht erstellt werden. Doppelte Mahlzeiten am selben Tag.';
            throw new Error('Dublicate meal on a one day!');

          }

          rows[meal.title].push(meal.description);

        });

        // add empty
        for (const key in rows) {
          if (rows[key].length < tableHeaders.length) {
            rows[key].push('-');
          }
        }

      });

      const newRows = [];
      const rowTitles = [];

      for (const key in rows) {
        if (key) {
          newRows.push(rows[key]);
          rowTitles.push(key);
        }
      }

      return { tableHeaders, rowEntries: newRows, rowTitles };
    };
  }


}
