/**
 * Das AccessData Object regelt die Zugriffsberechtigung auf ein
 * Dokument in der FirestoreDatabase. Jedes Dokument, dass über eine
 * Collection Query aufgerufen werden kann verfühgt über ein solches
 * AccessDaten-Objekt.
 *
 * - editor: Berechtigt zum edditieren von Daten in desem Dokument,
 * nicht aber zum löschen des Dokuemnts.
 *
 * - owner: Berechtigt zum edditieren und köschen des Dokuments.
 *
 */
export interface AccessData {

  /** Uids von Usern die das Object bearbeiten (nicht aber löschen) dürfen */
  editor: string[];

  /** Uids von Usern die das Object bearbeiten und löschen dürfen */
  owner: string[];

}
