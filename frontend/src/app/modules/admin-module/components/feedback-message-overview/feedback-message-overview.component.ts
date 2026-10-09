import {Component, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {SwissDateAdapter} from "../../../../shared/utils/format-datapicker";
import {AdminService, FeedbackMessage} from '../../services/admin.service';

const NEW_ISSUE_URL = 'https://github.com/wp99cp/eMeal_menuplanung/issues/new';

@Component({
  standalone: false,
  selector: 'app-feedback-message-overview',
  templateUrl: './feedback-message-overview.component.html',
  styleUrls: ['./feedback-message-overview.component.sass']
})
export class FeedbackMessageOverviewComponent implements OnInit {

  public feedbackMessages: Observable<FeedbackMessage[]>;

  // resolved messages are hidden by default
  public showResolved = false;

  constructor(private admin: AdminService,
              public swissDateAdapter: SwissDateAdapter) {
  }

  ngOnInit(): void {

    this.feedbackMessages = this.admin.getFeedbackMessages();

  }

  resolve(feedback: FeedbackMessage) {

    this.admin.resolveFeedbackMessage(feedback.id);

  }

  reopen(feedback: FeedbackMessage) {

    this.admin.reopenFeedbackMessage(feedback.id);

  }

  // an opened message stays open when the list changes
  trackById(index: number, feedback: FeedbackMessage): string {
    return feedback.id;
  }

  visibleMessages(messages: FeedbackMessage[]): FeedbackMessage[] {
    return this.showResolved ? messages : messages.filter(message => !message.resolved);
  }

  /**
   * The page the feedback was sent from, the users send its path. Other values are not linked.
   */
  pageLink(feedback: FeedbackMessage): string | undefined {
    return feedback.currentURL?.startsWith('/') && !feedback.currentURL.startsWith('//') ?
      feedback.currentURL : undefined;
  }

  /**
   * Link to a new GitHub issue with the content of the feedback. The repository is public, hence the name and
   * the mail address of the sender are not part of it.
   */
  newIssueLink(feedback: FeedbackMessage): string {

    const body = [
      feedback.message,
      '',
      '---',
      'Feedback vom ' + feedback.date_added.toDate().toLocaleDateString('de-CH') +
      (feedback.currentURL ? ', gesendet von der Seite `' + feedback.currentURL + '`' : '')
    ].join('\n');

    return NEW_ISSUE_URL + '?' + new URLSearchParams({title: feedback.title || 'Feedback', body});

  }

}
