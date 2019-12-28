/**
 * Settings Service
 *
 * This service offers some functions that can be changed on the settings page of the application.
 * For example it provides a convertion function of a date to it's swiss-date string according to
 * the settings of the user (which format).
 *
 */
export class SettingsService {

  /**
   * Konvertier ein Datum in den passenden 'Swiss-String'
   */
  public static toString(date: Date): string {

    return date.toLocaleDateString('de-CH', { weekday: 'long', year: 'numeric', month: 'short', day: '2-digit' });

  }

}
