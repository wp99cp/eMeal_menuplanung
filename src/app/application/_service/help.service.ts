import {Injectable} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {HelpComponent} from '../_dialoges/help/help.component';

@Injectable({
  providedIn: 'root'
})
export class HelpService {

  private isOpen = false;
  private dialog = null;

  constructor() {
  }

  openHelpPopup() {

    if (this.isOpen) {
      return;
    }
    this.isOpen = true;

    if (!this.dialog) {
      throw new Error('No Dialog added! Pleas add first a mat-dialog!');
    }

    this.dialog
      .open(HelpComponent, {
        height: '618px',
        width: '1000px',
        data: {}
      })
      .afterClosed()
      .subscribe(() => {
        this.isOpen = false;
      });


  }

  addDialog(dialog: MatDialog) {
    this.dialog = dialog;
  }

}
