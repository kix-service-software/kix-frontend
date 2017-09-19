import { StateAction, MenuEntry } from '@kix/core';
import { MainMenuAction } from './MainMenuAction';

export default (menuEntries: MenuEntry[]) => {
    const payload = new Promise((resolve, reject) => {
        resolve({ menuEntries });
    });

    return new StateAction(MainMenuAction.MAIN_MENU_ENTRIES_LOADED, payload);
};
