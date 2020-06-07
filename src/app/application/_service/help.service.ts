import {Injectable} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {HelpComponent} from '../_dialoges/help/help.component';
import {Router} from "@angular/router";

export interface HelpMessage {

  title: string;
  message: string;
  url: string;

}

@Injectable({
  providedIn: 'root'
})
export class HelpService {

  private static helpMessages: HelpMessage[] = [];
  private isOpen = false;
  private dialog = null;

  constructor(private router: Router) {
  }

  public addHelpMessage(helpMessage: HelpMessage) {

    HelpService.helpMessages.push(helpMessage);

  }

  openHelpPopup() {


    if (this.isOpen) {
      return;
    }
    this.isOpen = true;

    if (!this.dialog) {
      throw new Error('No Dialog added! Pleas add first a mat-dialog!');
    }

    const helpMessagesForThisPage = HelpService.helpMessages.filter(mess => mess.url === this.router.url);
    const index = Math.floor(Math.random() * helpMessagesForThisPage.length);

    let message = helpMessagesForThisPage[index];

    if (message === undefined) {
      message = {
        title: 'Nicht verfügbar!',
        message: 'Für diese Seite sind keine Hilfetexte/Erklärungen verfügbar.',
        url: ''
      };
    }

    this.dialog
      .open(HelpComponent, {
        height: '800px',
        width: '550px',
        data: {message}
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
