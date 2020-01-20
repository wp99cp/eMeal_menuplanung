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


interface HashTable { [key: string]: string[]; }


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
  public displayedColumnsRecipe: string[] = ['measure', 'totalMeasure', 'unit', 'food', 'comment'];

  public today: string;
  public user: Observable<User>;
  public shoppingListWithError: Observable<any>;
  public exportedCamp: Observable<{ data: { mealsInfo: any, campData: any, shoppingList: any } }>;
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
    this.exportedCamp = this.campId.pipe(flatMap(campId => this.databaseService.exportCamp(campId)));

    this.exportedCamp.subscribe(console.log);

    // set data
    this.weekTable = this.exportedCamp.pipe(map(exportedCamp => this.transformToWeekTable(exportedCamp.data.campData)));
    this.mealsInfo = this.exportedCamp.pipe(map(exportedCamp => exportedCamp.data.mealsInfo));
    this.shoppingListWithError = this.exportedCamp.pipe(map(exportedCamp => exportedCamp.data.shoppingList));

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
  private transformToWeekTable(campInfo: any) {

    // löscht frühere Fehlermeldungen
    this.weekViewErrorMessage = '';



    const days = campInfo.days;

    // sortieren nach Datum
    interface WithDate { date: number; }
    days.sort((a: WithDate, b: WithDate) => a.date - b.date);

    const tableHeaders = [];

    let rows: HashTable = {};

    days.forEach((day: { date: any; meals: [{ name: string; description: string; }]; }) => {

      // converts datum to local date string
      tableHeaders.push(SettingsService.toString(new Date(day.date._seconds * 1000)));

      // sort meals
      day.meals.sort((a, b) => a.name.localeCompare(b.name));

      // add meals of day
      day.meals.forEach(meal => {


        if (rows[meal.name] === undefined) {

          rows[meal.name] = [];
          for (let i = 0; i < tableHeaders.length - 1; i++) {
            rows[meal.name].push('-');
          }


        } else if (rows[meal.name].length === tableHeaders.length) {

          this.weekViewErrorMessage = 'Wochenplan kann nicht erstellt werden. Doppelte Mahlzeiten am selben Tag.';
          throw new Error('Dublicate meal on a one day!');

        }

        rows[meal.name].push(meal.description);

      });

      // add empty
      for (const key in rows) {
        if (rows[key].length < tableHeaders.length) {
          rows[key].push('-');
        }
      }

    });

    rows = this.sortList(rows);

    const newRows = [];
    const rowTitles = [];

    for (const key in rows) {
      if (key) {
        newRows.push(rows[key]);
        rowTitles.push(key);
      }
    }

    return { tableHeaders, rowEntries: newRows, rowTitles };

  }

  public toString(date) {
    return SettingsService.toString(new Date(date._seconds * 1000));
  }
  /**
   * Sortiert die Mahlzeiten in der richtigen Reihenfolge (Zmorgen, Znüni, ...)
   * und gibt das sortierte Object zurück.
   *
   * @param rows Zeilen der Tabelle
   */
  private sortList(rows: HashTable): HashTable {

    const rowsOrdered = {};

    // Reihenfolge der Mahlzeiten
    const orderOfMahlzeiten = ['Zmorgen', 'Znüni', 'Zmittag', 'Zvieri', 'Znacht', 'Leitersnack', 'Vorbereiten'];

    // Sortiert das Objekt
    Object.keys(rows)
      .sort((a, b) => orderOfMahlzeiten.indexOf(a) - orderOfMahlzeiten.indexOf(b))
      .forEach((key) => {
        rowsOrdered[key] = rows[key];
      });

    return rowsOrdered;

  }
}
