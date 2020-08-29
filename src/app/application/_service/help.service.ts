import {Injectable} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {HelpComponent} from '../_dialoges/help/help.component';
import {Router} from '@angular/router';

export interface HelpMessage {

  title: string;
  message: string;
  url: string;
  ref?: string;

}

@Injectable({
  providedIn: 'root'
})
export class HelpService {

  private static helpMessages: HelpMessage[] = [];
  private readonly defaultMessage: HelpMessage = {
    title: 'Keine Hilfetexte verfügbar',
    message: `Für diese Seite sind noch keine Tipps, Tricks und/oder Hilfetexte verfügbar. Gerne aber kannst du uns
                  über die Feedback-Funktion dein Anliegen schildern. Wir bemühen uns um eine Antwort/Lösung des Problems.<br>
                <br>
                <img width="100%" src="/assets/img/help_info_messages/Feedback_erfassen.png">`,
    url: ''
  };
  private isOpen = false;
  private dialog = null;

  constructor(private router: Router) {
  }

  public addHelpMessage(helpMessage: HelpMessage) {

    HelpService.helpMessages.push(helpMessage);

  }

  openHelpPopup(ref = '') {

    if (this.isOpen) {
      return;
    }

    this.isOpen = true;

    if (!this.dialog) {
      throw new Error('No Dialog added! Please add first a mat-dialog!');
    }

    let helpMessagesForThisPage = HelpService.helpMessages.filter(mess => mess.url === this.router.url);
    let index = Math.floor(Math.random() * helpMessagesForThisPage.length);
    if (ref !== '') {
      const elem =  helpMessagesForThisPage.filter(mess => mess.ref === ref)[0];
      index = helpMessagesForThisPage.indexOf(elem);
    }
    const message = helpMessagesForThisPage[index];

    if (message === undefined) {
      helpMessagesForThisPage = [this.defaultMessage];
      index = 0;
    }

    this.dialog
      .open(HelpComponent, {
        height: '800px',
        width: '550px',
        data: {index, messages: helpMessagesForThisPage}
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
