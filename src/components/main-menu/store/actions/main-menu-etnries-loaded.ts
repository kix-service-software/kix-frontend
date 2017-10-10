import { StateAction, MenuEntry } from '@kix/core/dist/model/client';
import { MainMenuAction } from './MainMenuAction';

export default (primaryMenuEntries: MenuEntry[], secondaryMenuEntries: MenuEntry[]) => {
    const payload = new Promise((resolve, reject) => {
        resolve({ primaryMenuEntries, secondaryMenuEntries });
    });

    return new StateAction(MainMenuAction.MAIN_MENU_ENTRIES_LOADED, payload);
};
