import {Injectable} from '@angular/core';
import {Observable, Subscriber} from 'rxjs';
import {Camp} from '../application/_class/camp';

@Injectable({
  providedIn: 'root'
})
export class CurrentlyUsedMealService {

  public lastUsage: Observable<Camp>;
  private subscriber: Subscriber<Camp>;

  constructor() {

    this.lastUsage = new Observable(subscriber => {
      this.subscriber = subscriber;
    });

  }

  addToHistory(name: Camp) {

    this.subscriber.next(name);

  }
}
