import {Component, OnInit} from '@angular/core';
import {MatSnackBar} from '@angular/material/snack-bar';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {HelpMessage} from '../../../application-module/services/help.service';
import {AdminService, HelpMessageWithId} from '../../services/admin.service';

/**
 * The fields of a help message as they are edited.
 */
interface Draft {
  title: string;
  description: string;
  category: string;
  ref: string;
  // one page per line
  urls: string;
  message: string;
}

const EMPTY_DRAFT: Draft = {title: '', description: '', category: '', ref: '', urls: '', message: ''};

@Component({
  standalone: false,
  selector: 'app-help-message-editor',
  templateUrl: './help-message-editor.component.html',
  styleUrls: ['./help-message-editor.component.sass']
})
export class HelpMessageEditorComponent implements OnInit {

  public helpMessages: Observable<HelpMessageWithId[]>;

  // the help message that gets created, undefined if there is none
  public newMessage: Draft | undefined;

  // the edited help messages by the id of their document
  private drafts = new Map<string, Draft>();

  constructor(private admin: AdminService,
              private snackBar: MatSnackBar) {
  }

  ngOnInit(): void {

    const sortKey = (message: HelpMessage) => (message.category || 'Allgemein') + '\n' + message.title;

    this.helpMessages = this.admin.getHelpMessages()
      .pipe(map(messages => [...messages].sort((a, b) => sortKey(a).localeCompare(sortKey(b), 'de'))));

  }

  create() {
    this.newMessage = {...EMPTY_DRAFT};
  }

  // an opened help message stays open when the list changes
  trackById(index: number, message: HelpMessageWithId): string {
    return message.id;
  }

  /**
   * @returns the draft of a help message, it is created when the message gets opened
   */
  draft(message: HelpMessageWithId): Draft {

    if (!this.drafts.has(message.id)) {
      this.drafts.set(message.id, {
        title: message.title ?? '',
        description: message.description ?? '',
        category: message.category ?? '',
        ref: message.ref ?? '',
        urls: (message.urls ?? []).join('\n'),
        message: message.message ?? ''
      });
    }

    return this.drafts.get(message.id);

  }

  isValid(draft: Draft): boolean {
    return draft.title.trim() !== '' && draft.message.trim() !== '';
  }

  async save(draft: Draft, id?: string) {

    const message: HelpMessage = {
      title: draft.title.trim(),
      message: draft.message,
      ref: draft.ref.trim(),
      urls: draft.urls.split('\n').map(url => url.trim().replace(/^\//, '')).filter(url => url !== '')
    };

    // empty optional fields are not saved
    if (draft.description.trim() !== '') {
      message.description = draft.description.trim();
    }
    if (draft.category.trim() !== '') {
      message.category = draft.category.trim();
    }

    try {
      await this.admin.saveHelpMessage(id, message);
    } catch (error) {
      console.error(error);
      this.snackBar.open('Der Hilfetext konnte nicht gespeichert werden.', '', {duration: 4000});
      return;
    }

    if (id === undefined) {
      this.newMessage = undefined;
    } else {
      this.drafts.delete(id);
    }

    this.snackBar.open('Hilfetext gespeichert.', '', {duration: 2500});

  }

  reset(id: string) {
    this.drafts.delete(id);
  }

  async delete(message: HelpMessageWithId) {

    if (!confirm('Den Hilfetext «' + message.title + '» löschen?')) {
      return;
    }

    await this.admin.deleteHelpMessage(message.id);
    this.drafts.delete(message.id);

  }

}
