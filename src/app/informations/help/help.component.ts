import {Component, OnInit} from '@angular/core';
import {AngularFirestore} from '@angular/fire/firestore';
import {map} from 'rxjs/operators';
import {HelpMessage} from '../../application/_service/help.service';
import {Observable} from 'rxjs';

type HelpMessages = HelpMessage[];


@Component({
  selector: 'app-help',
  templateUrl: './help.component.html',
  styleUrls: ['./help.component.sass']
})
export class HelpComponent implements OnInit {

  public helpMessagesByCat: Observable<{ [_: string]: HelpMessages }>;
  public Object = Object;

  constructor(private db: AngularFirestore) {

    this.helpMessagesByCat = db.collection('/sharedData/helpMessages/messages').get()
      .pipe(
        // Create HelpMessage Objects
        map(ref => ref.docs.map(doc => doc.data() as HelpMessage)),
        // Group by category
        map(arr => arr.reduce((r, a) => {
          a.category = a.category ? a.category : 'Allgemein';
          r[a.category] = r[a.category] || [];
          r[a.category].push(a);
          return r;
        }, {}))
      );

  }

  ngOnInit(): void {

    this.helpMessagesByCat.subscribe(help => console.log(Object.keys(help)));

  }

}
