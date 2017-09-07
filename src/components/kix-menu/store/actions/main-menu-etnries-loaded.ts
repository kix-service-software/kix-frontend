import { MenuEntry } from './../../../../model/client/components/main-menu/MenuEntry';
import { StateAction } from './../../../../model/client/store/StateAction';
import { MainMenuAction } from './MainMenuAction';

export default (menuEntries: MenuEntry[]) => {
    const payload = new Promise((resolve, reject) => {
        resolve({ menuEntries });
    });

    return new StateAction(MainMenuAction.MAIN_MENU_ENTRIES_LOADED, payload);
};
