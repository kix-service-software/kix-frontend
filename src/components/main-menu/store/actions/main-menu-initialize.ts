import { StateAction } from '@kix/core/dist/browser/StateAction';
import { MainMenuSocketListener } from './../../socket/MainMenuSocketListener';
import { MAIN_MENU_LOAD_ENTRIES, MAIN_MENU_ENTRIES_LOADED } from './';
import { MainMenuAction } from './MainMenuAction';

export default () => {
    const payload = new Promise((resolve, reject) => {
        const mainMenuSocketListener = new MainMenuSocketListener();
        resolve({ mainMenuSocketListener });
    });
    return new StateAction(MainMenuAction.MAIN_MENU_INITIALIZE, payload);
};
