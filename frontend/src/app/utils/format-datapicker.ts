import { NativeDateAdapter } from '@angular/material/core';
import {Injectable} from '@angular/core';

/**
 * Converts a Date to a SwissDateString
 */
@Injectable()
export class SwissDateAdapter extends NativeDateAdapter {

  /**
   * Creates String out of date with the form "30. Jan. 2020"
   */
  public format(date: Date): string {
    return date.toLocaleDateString('de-CH',
      { year: 'numeric', month: 'short', day: '2-digit' });
  }


  /**
   * Creates String out of date with the form "30. Jan. 2020"
   */
  public format_time(date: Date): string {
    return date.toLocaleDateString('de-CH',
      { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' });
  }

  /**
   * Creates String out of date with the form "Montag, 03. Feb. 2020"
   */
  public formatLong(date: Date): string {
    return date.toLocaleDateString('de-CH',
      { weekday: 'long', year: 'numeric', month: 'short', day: '2-digit' });
  }

  public weekday(date: Date): string {
    return date.toLocaleDateString('de-CH',
      { weekday: 'long' });
  }

}
