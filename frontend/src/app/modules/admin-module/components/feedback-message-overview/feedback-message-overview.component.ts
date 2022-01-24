import {Component, OnInit} from '@angular/core';
import {map} from 'rxjs/operators';
import {Observable} from 'rxjs';
import {DatabaseService} from "../../../application-module/services/database.service";
import {SwissDateAdapter} from "../../../../shared/utils/format-datapicker";

@Component({
  selector: 'app-feedback-message-overview',
  templateUrl: './feedback-message-overview.component.html',
  styleUrls: ['./feedback-message-overview.component.sass']
})
export class FeedbackMessageOverviewComponent implements OnInit {

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
