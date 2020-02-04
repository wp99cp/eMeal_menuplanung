import { FirestoreCamp } from '../_interfaces/firestoreDatatypes';
import { DatabaseService } from '../_service/database.service';
import { Day } from './day';
import { ExportableObject, FirestoreObject } from './firebaseObject';

/**
 * Repräsentiert ein Lager.
 *
 * Object Typ zu FirestoreCamp
 *
 */
export class Camp extends FirestoreObject implements ExportableObject {

  public readonly path: string;
  public readonly documentId: string;

  // fields of a camp
  public name: string;
  public description: string;
  public participants: number;
  public year: string;
  public vegetarians: number;
  public leaders: number;

  // Data of the days
  public days: Day[] = [];

  constructor(firestoreCamp: FirestoreCamp, path: string) {

    super(firestoreCamp);

    // set path and document id
    this.documentId = path.substring(path.lastIndexOf('/') + 1);
    this.path = path;

    this.description = firestoreCamp.camp_description;
    this.name = firestoreCamp.camp_name;
    this.participants = firestoreCamp.camp_participants;
    this.year = firestoreCamp.camp_year;
    this.vegetarians = firestoreCamp.camp_vegetarians;
    this.leaders = firestoreCamp.camp_leaders;

    // ladet die Daten der Tage
    for (const dayData of firestoreCamp.days) {

      this.days.push(new Day(dayData, this.documentId));
    }

    // Sortiert die Tage aufsetigend
    this.days.sort((a, b) => a.dateAsTypeDate.getTime() - b.dateAsTypeDate.getTime());

  }

  /**
   * Ladet die Mahlzeiten des Lagers.
   * Das Lager wird im Normalfall ohne
   * die Mahlzeitdaten geladen. Diese müssen
   * mit dieser Funktion nachgeladen werden.
   *
   */
  public loadMeals(dbService: DatabaseService) {

    this.days.forEach(day => day.loadMeals(dbService));

  }

  public toFirestoreDocument(): FirestoreCamp {

    const camp = super.toFirestoreDocument() as FirestoreCamp;

    camp.camp_name = this.name;
    camp.camp_description = this.description;
    camp.camp_year = this.year;

    camp.camp_participants = this.participants;
    camp.camp_vegetarians = this.vegetarians;
    camp.camp_leaders = this.leaders;

    camp.days = this.days.map(day => day.exportDay());

    return camp;

  }


}
