import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../../_interfaces/user';
import { AuthenticationService } from '../../_service/authentication.service';
import { DatabaseService } from '../../_service/database.service';
import { Camp } from '../../_class/camp';

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

  protected today: string;

  protected user: Observable<User>;
  protected shoppingList: Observable<any>;
  protected campInfo: Observable<any>;
  protected mealsInfo: Observable<any>;

  constructor(private authService: AuthenticationService, private databaseService: DatabaseService) {

    this.today = (new Date()).toLocaleDateString('de-CH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    // Test function
    databaseService.getMealsInfoExport().subscribe(console.log);

  }

  ngOnInit() {

    this.user = this.authService.getCurrentUser();
    this.shoppingList = this.databaseService.getShoppingList();
    this.campInfo = this.databaseService.getCampInfoExport();
    this.mealsInfo = this.databaseService.getMealsInfoExport();

  }

  /** Druckt die aktuelle Seite (mit der Druckfunktion des Browsers). */
  print() {

    window.print();

  }

}
