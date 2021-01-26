import {Injectable} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {HelpComponent} from '../_dialoges/help/help.component';
import {Router} from '@angular/router';
import {DatabaseService} from './database.service';
import {take} from 'rxjs/operators';

export interface HelpMessage {

  title: string;
  message: string;
  urls: string[];
  ref: string;

}

@Injectable({
  providedIn: 'root'
})
export class HelpService {

  private readonly defaultMessage: HelpMessage = {
    title: 'Keine Hilfetexte verfügbar',
    message: `Für diese Seite sind noch keine Tipps, Tricks und/oder Hilfetexte verfügbar. Gerne aber kannst du uns
                  über die Feedback-Funktion dein Anliegen schildern. Wir bemühen uns um eine Antwort/Lösung des Problems.<br>
                <br>
                <img width="100%" src="/assets/img/help_info_messages/Feedback_erfassen.png">`,
    urls: [],
    ref: 'default'
  };
  private isOpen = false;
  private dialog = null;
  private dbService: DatabaseService;

  constructor(private router: Router) {
  }

  openHelpPopup(ref = '') {

    if (this.isOpen) {
      return;
    }

    this.isOpen = true;

    if (!this.dialog) {
      throw new Error('No Dialog added! Please add first a mat-dialog!');
    }

    const currentURL = this.generalizeURL(this.router.url);

    console.log('[Help Service] Open dialog for \'' + currentURL + '\'.');

    this.dbService.requestCollection('/sharedData/helpMessages/messages',
      doc => doc.where('urls', 'array-contains', currentURL))
      .pipe(take(1))
      .subscribe(messages => {

        let helpMessagesForThisPage = messages.map(docs => docs.payload.doc.data() as HelpMessage);
        let index = Math.floor(Math.random() * helpMessagesForThisPage.length);
        if (ref !== '') {
          const elem = helpMessagesForThisPage.filter(mess => mess.ref === ref)[0];
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

      });


  }

  addDialog(dialog: MatDialog) {
    this.dialog = dialog;
  }

  addDBService(databaseService: DatabaseService) {
    this.dbService = databaseService;
  }

  private generalizeURL(url: string) {

    function replacer(match, slash, folder) {
      const knownFolders = ['app', 'camps', 'meals', 'recipes', 'settings'];
      return knownFolders.includes(folder) ? match : '/*';
    }

    return url.replace(/(\/)([a-zA-Z0-9_.-]+)/gm, replacer).replace(/^\//, '');

  }

}
