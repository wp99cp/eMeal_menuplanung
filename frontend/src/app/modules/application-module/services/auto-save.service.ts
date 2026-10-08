import {Injectable} from '@angular/core';
import {SaveStatusService} from './save-status.service';


export interface Saveable {

  /**
   * Saves all unsaved changes in this Component.
   *
   * @returns should return true if some changes got saved and false otherwise. The promise has to resolve after
   * the changes are written and has to reject if they could not be written.
   */
  save: () => Promise<boolean>;

}


@Injectable({
  providedIn: 'root'
})
/**
 * AutoSaveService: Speichert die Änderungen automatisch, sobald eine Pause beim Tippen entsteht, sowie beim Wechseln
 * einer Seite. Der Stand wird über den SaveStatusService im Header angezeigt.
 *
 *  Aktiviertung:
 *  Muss im module-rooting aktiviert werden und der entsprechende Component muss das Interface Saveable implemntieren.
 *  Der Component meldet jede Änderung mit newUnsavedChanges().
 */
export class AutoSaveService {

  /** Pause in the typing (in ms) after which the changes get saved. */
  private static readonly TYPING_PAUSE = 800;

  private autosaveOnComponents: Saveable[] = [];
  private timer: ReturnType<typeof setTimeout>;
  private changeCounter = 0;

  constructor(private saveStatus: SaveStatusService) {

    // The changes get saved, but this can not be awaited before the window closes. So the browser asks the user.
    window.addEventListener('beforeunload', event => {

      if (!this.saveStatus.hasUnsavedWork()) {
        return;
      }

      this.saveChanges();
      event.preventDefault();
      event.returnValue = '';

    });

  }

  /**
   * Has to be called on every change that the method save() of a registered component would write.
   */
  newUnsavedChanges() {

    this.changeCounter++;
    this.saveStatus.setUnsaved(true);

    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.saveChanges(), AutoSaveService.TYPING_PAUSE);

  }

  /**
   * Saves the changes of all registered components now.
   */
  saveChanges = () => this.saveComponents(this.autosaveOnComponents);

  /**
   * Wird beim Wechsel der Seiten aufgerufen.
   *
   */
  canDeactivate(component: Saveable) {

    this.autosaveOnComponents = this.autosaveOnComponents.filter(comp => comp !== component);

    // has to be called now, afterwards the component gets destroyed
    this.saveComponents([component]);

    // Erlaubt das Wechseln der Seite(return true).
    return true;

  }

  register(savable: Saveable) {

    this.autosaveOnComponents.push(savable);
    return true;

  }

  private async saveComponents(components: Saveable[]) {

    clearTimeout(this.timer);
    const changeCounter = this.changeCounter;

    try {
      await Promise.all(components.map(comp => comp.save()));
    } catch (error) {
      console.error(error);
      this.saveStatus.addFailed(this, this.saveChanges);
      return;
    }

    this.saveStatus.removeFailed(this);

    // changes made while the save was running are written by the next save
    if (changeCounter === this.changeCounter) {
      this.saveStatus.setUnsaved(false);
    }

  }

}
