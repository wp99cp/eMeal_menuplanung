import { Component, OnInit, ViewChild } from '@angular/core';
import { Observable, of } from 'rxjs';
import { User } from '../../_interfaces/user';
import { AuthenticationService } from '../../_service/authentication.service';
import { DatabaseService } from '../../_service/database.service';
import { MatAccordion } from '@angular/material/expansion';
import { ActivatedRoute } from '@angular/router';
import { map, flatMap } from 'rxjs/operators';
import { TemplateHeaderComponent as Header } from 'src/app/_template/template-header/template-header.component';

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


  public displayedColumns: string[] = ['measure', 'unit', 'food'];

  private campId: Observable<string>;

  public today: string;
  public user: Observable<User>;
  public shoppingListWithError: Observable<any>;
  public campInfo: Observable<any>;
  public weekTable: Observable<any>;
  public mealsInfo: Observable<any>;

  constructor(private route: ActivatedRoute, private authService: AuthenticationService, private databaseService: DatabaseService) {

    this.today = (new Date()).toLocaleDateString('de-CH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    // load camp from url
    this.route.url.subscribe(url => this.campId = of(url[1].path));

  }

  ngOnInit() {


    this.user = this.authService.getCurrentUser();

    this.shoppingListWithError = this.campId.pipe(flatMap(campId => this.databaseService.getShoppingList(campId)));
    this.campInfo = this.campId.pipe(flatMap(campId => this.databaseService.getCampInfoExport(campId)));

    this.campInfo.subscribe(campInfo =>
      this.setHeaderInfo(campInfo.data.name)
    );

    this.weekTable = this.campInfo.pipe(map(campInfo => {

      const days = campInfo.data.days;

      // sortieren nach Datum
      days.sort((a, b) => a.date - b.date);

      const tableHeaders = [];

      interface HashTable {
        [key: string]: string[];
      }
      const rows: HashTable = {};

      days.forEach((day: { date: any; meals: [{ title: string; description: string; }] }) => {

        tableHeaders.push(new Date(day.date._seconds * 1000).toDateString());

        // sort meals
        day.meals.sort((a, b) => a.title.localeCompare(b.title));

        // add meals of day
        day.meals.forEach(meal => {
          if (rows[meal.title] === undefined) {
            rows[meal.title] = [];

            for (let i = 0; i < tableHeaders.length - 1; i++) {
              rows[meal.title].push('-');
            }

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

        newRows.push(rows[key]);
        rowTitles.push(key);

      }

      const result: any = { tableHeaders, rowEntries: newRows, rowTitles };
      return result;

    }));
    this.mealsInfo = this.databaseService.getMealsInfoExport();

    // print on console
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
  private setHeaderInfo(name): void {

    Header.title = 'Zusammenfassung ' + name;
    Header.path = ['Startseite', 'meine Lager', name, 'Zusammenfassung'];

  }

}


