import {Injectable} from '@angular/core';

export interface ContextMenuEntry {
  icon: string;
  name: string;
  shortCut: string;
  disabled?: boolean;
  function: (MouseEvent) => void;
}

export type Separator = 'Separator';

export interface ContextMenuNode {
  node: HTMLElement;
  contextMenuEntries: (ContextMenuEntry | Separator)[];
}

@Injectable({
  providedIn: 'root'
})
export class ContextMenuService {

  public contextMenuEntries: (ContextMenuEntry | Separator)[] = [];
  private isActive = false;
  private nodesWithContextMenu: ContextMenuNode[] = [];

  constructor() {
  }

  public addContextMenuNode(node: ContextMenuNode) {

    this.nodesWithContextMenu.push(node);

  }

  public activate() {

    this.isActive = true;

    document.querySelector('html')
      .addEventListener('contextmenu', event => this.openContextMenu(event));

    document.querySelector('html')
      .addEventListener('click', event => this.closeContextMenu());

  }

  private openContextMenu(event: MouseEvent) {

    console.log('Open Context Menu')

    this.closeContextMenu();

    if (!this.isActive) {
      return;
    }

    this.nodesWithContextMenu = this.nodesWithContextMenu.filter(elem => elem !== null);
    this.nodesWithContextMenu.forEach(entry => {


      if (entry.node?.contains(event.target as Node)) {

        this.createContextMenu(event, entry, event.clientX, event.clientY);
        return;

      }

    });

    event.preventDefault();

  }

  private closeContextMenu() {

    const contextMenu = document.getElementById('context-menu-container');
    if (contextMenu) {
      document.body.removeChild(contextMenu);
    }

  }

  private createContextMenu(event: MouseEvent, contextMenu: ContextMenuNode, x: number, y: number) {


    this.contextMenuEntries = contextMenu.contextMenuEntries;

    let menuDiv = document.getElementById('context-menu-container');
    if (menuDiv) {
      document.body.removeChild(menuDiv);
    }

    menuDiv = document.createElement('div');

    menuDiv.id = 'context-menu-container';
    menuDiv.style.top = (y - 40) + 'px';
    menuDiv.style.left = (x - 40) + 'px';
    menuDiv.tabIndex = -1;
    menuDiv.style.padding = '40px';

    const innerDiv = document.createElement('div');
    innerDiv.id = 'context-menu';
    menuDiv.appendChild(innerDiv);

    menuDiv.addEventListener('mouseleave', () => this.closeContextMenu());


    this.contextMenuEntries.forEach(e => {

        if (typeof e === 'object') {
          const entryDiv = document.createElement('div');
          entryDiv.classList.add('entry');

          if (e.disabled)
            entryDiv.classList.add('disabled');

          entryDiv.innerHTML = `<mat-icon class="mat-icon">${e.icon}</mat-icon><span class="context-menu-entry-name">${e.name}</span>`
            + `<span class="context-menu-entry-shortcut">${e.shortCut}</span>`;

          if (!e.disabled) {
            entryDiv.addEventListener('click', () => {
              console.log('event!');
              e.function(event);
              this.closeContextMenu();
            });
          }
          innerDiv.appendChild(entryDiv);

        } else {
          innerDiv.appendChild(document.createElement('hr'));
        }
      }
    );

    document.body.appendChild(menuDiv);

  }

}
