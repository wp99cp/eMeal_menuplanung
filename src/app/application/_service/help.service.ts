import {Injectable} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {HelpComponent} from '../_dialoges/help/help.component';

export interface HelpMessage {

  title: string;
  message: string;

}

@Injectable({
  providedIn: 'root'
})
export class HelpService {

  constructor() {
  }

  private static helpMessages: HelpMessage[] = [];

  private isOpen = false;
  private dialog = null;

  public addHelpMessage(helpMessage: HelpMessage) {

    HelpService.helpMessages.push(helpMessage);
    console.log(helpMessage)

  }

  openHelpPopup() {

    if (this.isOpen) {
      return;
    }
    this.isOpen = true;

    if (!this.dialog) {
      throw new Error('No Dialog added! Pleas add first a mat-dialog!');
    }

    const index = Math.floor(Math.random() * HelpService.helpMessages.length);
    this.dialog
      .open(HelpComponent, {
        height: '800px',
        width: '550px',
        data: {
          message: HelpService.helpMessages[index]
        }
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
