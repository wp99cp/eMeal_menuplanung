import {Injectable, NgZone} from '@angular/core';
import {BehaviorSubject} from 'rxjs';

/**
 * idle: nothing got changed since the application was opened
 * saving: changes wait for the end of the typing pause or for the answer of the server
 * saved: all changes reached the server
 * offline: no connection, `waiting` tells whether changes wait for the connection
 * error: the server rejected at least one change
 */
export type SaveState = 'idle' | 'saving' | 'saved' | 'offline' | 'error';

export interface SaveStatus {
  state: SaveState;
  waiting: boolean;
}

/**
 * Knows whether the changes of the user reached the server. All writes of the DatabaseService are tracked here,
 * the AutoSaveService reports the changes that are not written yet.
 *
 * Firestore keeps the writes of an offline client in memory and sends them in the original order as soon as the
 * connection is back. Their promises resolve only then, therefore pending writes are unsaved work.
 *
 */
@Injectable({
  providedIn: 'root'
})
export class SaveStatusService {

  private unsaved = false;
  private pendingWrites = 0;
  private savedOnce = false;
  private online = navigator.onLine;
  private failed = new Map<unknown, () => unknown>();

  private statusSubject = new BehaviorSubject<SaveStatus>({state: 'idle', waiting: false});
  public readonly status = this.statusSubject.asObservable();

  constructor(private zone: NgZone) {

    window.addEventListener('online', () => this.setOnline(true));
    window.addEventListener('offline', () => this.setOnline(false));

  }

  /**
   * Executes a write and tracks its outcome. A rejected write can be repeated with retryFailed().
   *
   * @param write is called again on a retry, it should read the data to write when it gets called
   * @param target what gets written, e.g. the path of the document. A successful write to the same target replaces
   * a failed one.
   */
  public track<T>(write: () => Promise<T>, target: unknown = write): Promise<T> {

    this.pendingWrites++;
    this.update();

    return new Promise<T>(resolve => resolve(write())).then(result => {

      this.pendingWrites--;
      this.savedOnce = true;
      this.failed.delete(target);
      this.update();
      return result;

    }, error => {

      console.error(error);
      this.pendingWrites--;
      this.addFailed(target, () => this.track(write, target).catch(() => null));
      throw error;

    });

  }

  /**
   * Marks whether there are changes that are not handed over to the database yet.
   */
  public setUnsaved(unsaved: boolean) {

    this.unsaved = unsaved;
    this.update();

  }

  /**
   * Reports a failed save.
   *
   * @param target what could not be saved, a further failure of the same target replaces this one
   * @param retry repeats the save, it has to report a further failure itself
   */
  public addFailed(target: unknown, retry: () => unknown) {

    this.failed.set(target, retry);
    this.update();

  }

  /**
   * Reports that a failed save succeeded in the meantime.
   */
  public removeFailed(target: unknown) {

    this.failed.delete(target);
    this.update();

  }

  public retryFailed() {

    const retries = Array.from(this.failed.values());
    this.failed.clear();
    this.update();
    retries.forEach(retry => retry());

  }

  /**
   * @returns true if closing the window now would lose changes
   */
  public hasUnsavedWork() {

    return this.unsaved || this.pendingWrites > 0 || this.failed.size > 0;

  }

  private setOnline(online: boolean) {

    this.online = online;
    this.update();

  }

  private update() {

    const waiting = this.unsaved || this.pendingWrites > 0;
    let state: SaveState;

    if (this.failed.size > 0) {
      state = 'error';
    } else if (!this.online) {
      state = 'offline';
    } else if (waiting) {
      state = 'saving';
    } else {
      state = this.savedOnce ? 'saved' : 'idle';
    }

    const current = this.statusSubject.value;
    if (current.state !== state || current.waiting !== waiting) {
      // the promises of firestore resolve outside of the angular zone
      this.zone.run(() => this.statusSubject.next({state, waiting}));
    }

  }

}
