import {Component, OnInit} from '@angular/core';
import {AngularFirestore} from '@angular/fire/firestore';
import {map} from 'rxjs/operators';
import {HelpMessage} from '../../application/_service/help.service';
import {Observable} from 'rxjs';

@Component({
  selector: 'app-help',
  templateUrl: './help.component.html',
  styleUrls: ['./help.component.sass']
})
export class HelpComponent implements OnInit {

  public helpMessages: Observable<HelpMessage[]>;

  constructor(private db: AngularFirestore) {

    this.helpMessages = db.collection('/sharedData/helpMessages/messages').get()
      .pipe(map(ref => ref.docs.map(doc => doc.data() as HelpMessage)));

  }

  ngOnInit(): void {
  }

}
