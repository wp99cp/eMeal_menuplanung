import { Component, OnInit, ViewChild } from '@angular/core';
import { Observable, of } from 'rxjs';
import { User } from '../../_interfaces/user';
import { AuthenticationService } from '../../_service/authentication.service';
import { DatabaseService } from '../../_service/database.service';
import { Camp } from '../../_class/camp';
import { MatAccordion } from '@angular/material/expansion';
import { ActivatedRoute } from '@angular/router';
import { map, flatMap } from 'rxjs/operators';

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
  protected campInfo: Observable<any>;
  protected mealsInfo: Observable<any>;

  constructor(private route: ActivatedRoute, private authService: AuthenticationService, private databaseService: DatabaseService) {

    this.today = (new Date()).toLocaleDateString('de-CH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    // load camp from url
    this.route.url.subscribe(url => this.campId = of(url[1].path));

  }

  ngOnInit() {


    this.user = this.authService.getCurrentUser();

    this.shoppingListWithError = this.campId.pipe(flatMap(campId => this.databaseService.getShoppingList(campId)));
    this.campInfo = this.campId.pipe(flatMap(campId => this.databaseService.getCampInfoExport(campId)));
    this.mealsInfo = this.databaseService.getMealsInfoExport();

    this.shoppingListWithError.subscribe(console.log);
    this.campInfo.subscribe(console.log);

    this.mealsInfo.subscribe(console.log);

  }

  /** Druckt die aktuelle Seite (mit der Druckfunktion des Browsers). */
  async print() {

    await this.Accordion.openAll();

    window.print();

  }

}
