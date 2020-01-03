import { Injectable, NgZone } from '@angular/core';
import { CanDeactivate } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';


export interface Saveable {

  save: () => Promise<boolean>;

}


@Injectable({
  providedIn: 'root'
})
/**
 * AutoSaveService
 */
export class AutoSaveService implements CanDeactivate<Saveable> {

  constructor(
    public snackBar: MatSnackBar,
    private zone: NgZone
  ) { }

  canDeactivate(component: Saveable) {



    component.save().then(
      saved => {
        if (saved) {
          this.zone.run(() => {
            this.snackBar.open('Änderungen wurden automatisch gespeichert!', '', { duration: 2000 });
          });
        }
      }
    );

    return true;

  }

}
