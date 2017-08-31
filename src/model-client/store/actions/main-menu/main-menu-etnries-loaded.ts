import { MenuEntry } from './../../../menu/MenuEntry';
import { StateAction } from './../StateAction';
import { MainMenuAction } from './MainMenuAction';

export default (menuEntries: MenuEntry[]) => {
    const payload = new Promise((resolve, reject) => {
        resolve({ menuEntries });
    });

    return new StateAction(MainMenuAction.MAIN_MENU_ENTRIES_LOADED, payload);
};
