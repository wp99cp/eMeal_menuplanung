import {Injectable} from '@angular/core';
import {AutoSaveService} from './auto-save.service';
import {HelpService} from './help.service';

@Injectable({
  providedIn: 'root'
})
export class ShortcutService {

  constructor(private autosave: AutoSaveService, private helpService: HelpService) {
  }

  activate() {

    document.body.addEventListener('keydown', (event: KeyboardEvent) => {

      if (event.key === 'F1') {

        this.helpService.openHelpPopup();
        event.preventDefault();

      }

      if (event.key === 's' && event.ctrlKey) {

        this.autosave.saveChanges();
        event.preventDefault();

      }

    });

  }

}
