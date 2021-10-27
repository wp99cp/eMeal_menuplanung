import {Injectable} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {HelpComponent} from '../_dialoges/help/help.component';
import {Router} from '@angular/router';
import {AngularFirestore} from '@angular/fire/firestore';

export interface HelpMessage {
  title: string;
  message: string;
  urls: string[];
  ref: string;
  description?: string;
  category?: string;
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

  constructor(private router: Router,
              private db: AngularFirestore) {

    console.log('Create');

  }

  async openHelpPopup(ref = '') {

    if (this.isOpen) {
      return;
    }

    this.isOpen = true;

    if (!this.dialog) {
      throw new Error('No Dialog added! Please add first a mat-dialog!');
    }

    if (!this.db) {
      throw new Error('No DB-Service added! Please add first a DB-Service!');
    }

    const currentURL = this.generalizeURL(this.router.url);

    console.log('[Help Service] Open dialog for \'' + currentURL + '\'.');

    const helpMessages = (await this.db.collection('/sharedData/helpMessages/messages',
      doc => doc.where('urls', 'array-contains', currentURL)).get().toPromise()).docs;

    let helpMessagesForThisPage = helpMessages.map(docs => docs.data() as HelpMessage);
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


  }

  addDialog(dialog: MatDialog) {
    console.log('Add Dialog');
    this.dialog = dialog;
  }


  private generalizeURL(url: string) {

    function replacer(match, slash, folder) {
      const knownFolders = ['app', 'camps', 'meals', 'recipes', 'settings', 'export', 'login', 'oauth-callback'];
      return knownFolders.includes(folder) ? match : '/*';
    }

    let generalizedURL = url.replace(/(\/)([a-zA-Z0-9_.-]+)/gm, replacer).replace(/^\//, '');

    const indexOfQuery = generalizedURL.indexOf('?');
    if (indexOfQuery > 0) {
      generalizedURL = generalizedURL.substring(0, indexOfQuery);
    }

    return generalizedURL;

  }

}
