import {Component, OnInit} from '@angular/core';
import {map} from 'rxjs/operators';
import {DatabaseService} from '../../../application/_service/database.service';
import {Observable} from 'rxjs';
import {SwissDateAdapter} from '../../../utils/format-datapicker';

@Component({
  selector: 'app-help-message-overview',
  templateUrl: './help-message-overview.component.html',
  styleUrls: ['./help-message-overview.component.sass']
})
export class HelpMessageOverviewComponent implements OnInit {

  public feedbackMessages: Observable<any>;

  constructor(private db: DatabaseService,
              public swissDateAdapter: SwissDateAdapter) {
  }

  ngOnInit(): void {

    this.feedbackMessages = this.db.getFeedbackMessages()
      .pipe(map(ref => ref.map(doc => {
        const obj: any = doc.payload.doc.data();
        obj.id = doc.payload.doc.id;
        return obj;
      })));

  }

  resolve_issue(docID: string) {

    this.db.resolve_issue(docID);

  }
}
