import { MenuEntry } from '@kix/core/dist/model';
import { MainMenuAction } from './MainMenuAction';
import { StateAction } from '@kix/core/dist/browser/StateAction';

export default (primaryMenuEntries: MenuEntry[], secondaryMenuEntries: MenuEntry[], showText: boolean) => {
    const payload = new Promise((resolve, reject) => {
        resolve({ primaryMenuEntries, secondaryMenuEntries, showText });
    });

    return new StateAction(MainMenuAction.MAIN_MENU_ENTRIES_LOADED, payload);
};
