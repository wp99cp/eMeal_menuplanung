import {Injectable} from '@angular/core';
import {AutoSaveService} from './auto-save.service';

@Injectable({
  providedIn: 'root'
})
export class ShortcutService {

  constructor(private autosave: AutoSaveService) {
  }

  activate() {

    document.body.addEventListener('keydown', (event: KeyboardEvent) => {

      if (event.key === 'F1') {

        event.preventDefault();

      }

      if (event.key === 's' && event.ctrlKey) {

        this.autosave.saveChanges();
        event.preventDefault();

      }

    });

  }

}
