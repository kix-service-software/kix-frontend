import { MenuEntry } from './../MenuEntry';

export class MainMenuEntriesResult {

    public menuEntries: MenuEntry[];

    public constructor(menuEntries: MenuEntry[]) {
        this.menuEntries = menuEntries;
    }

}
