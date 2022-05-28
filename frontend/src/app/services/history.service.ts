import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {Camp} from "../modules/application-module/classes/camp";

@Injectable({
  providedIn: 'root'
})
export class HistoryService {

  public lastUsedCamp: BehaviorSubject<Camp>;

  constructor() {
    this.lastUsedCamp = new BehaviorSubject(undefined);
  }

  addToHistory(camp: Camp) {
    this.lastUsedCamp.next(camp);
  }

}
