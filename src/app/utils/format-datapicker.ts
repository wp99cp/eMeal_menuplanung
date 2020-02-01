import { NativeDateAdapter } from '@angular/material';

/**
 * Converts a Date to a SwissDateString
 */
export class SwissDateAdapter extends NativeDateAdapter {

  /**
   * Creates String out of date with the form "30. Jan. 2020"
   */
  public format(date: Date): string {
    return date.toLocaleDateString('de-CH',
      { year: 'numeric', month: 'short', day: '2-digit' });
  }

  /**
   * Creates String out of date with the form "Montag, 03. Feb. 2020"
   */
  public formatLong(date: Date): string {
    return date.toLocaleDateString('de-CH',
      { weekday: 'long', year: 'numeric', month: 'short', day: '2-digit' });
  }

}
