import { MainMenuEntriesResult, MainMenuEvent, MainMenuSocketListener } from './../../../socket/main-menu/';
import { StateAction } from './../../StateAction';
import { SocketEvent } from '../../../socket/SocketEvent';
import { MAIN_MENU_LOAD_ENTRIES, MAIN_MENU_ENTRIES_LOADED } from './';
import { MainMenuAction } from './MainMenuAction';

declare var io: any;

export default (frontendSocketUrl: string) => {
    const payload = new Promise((resolve, reject) => {
        const mainMenuSocketListener = new MainMenuSocketListener(frontendSocketUrl);
        resolve({ mainMenuSocketListener });
    });
    return new StateAction(MainMenuAction.MAIN_MENU_INITIALIZE, payload);
};
