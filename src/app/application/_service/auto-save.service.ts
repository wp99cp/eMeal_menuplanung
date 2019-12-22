import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';


export interface Saveable {

  save: () => void;

}

@Injectable({
  providedIn: 'root'
})
/**
 * AutoSaveService
 */
export class AutoSaveService implements CanDeactivate<Saveable> {

  canDeactivate(component: Saveable) {

    component.save();
    return true;

  }

}
