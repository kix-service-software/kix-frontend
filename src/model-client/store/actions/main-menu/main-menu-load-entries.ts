import { Server } from './../../../../Server';
import { MenuState, MenuEntry, MainMenuEvent } from './../../../menu/';
import { StateAction } from './../StateAction';
import { MainMenuAction } from './MainMenuAction';

export default (socket: SocketIO.Server) => {
    const payload = new Promise((resolve, reject) => {
        resolve(loadEntries(socket));
    });

    return new StateAction(MainMenuAction.MAIN_MENU_ENTRIES_LOADED, payload);
};

function loadEntries(socket: SocketIO.Server): any {
    socket.emit(MainMenuEvent.LOAD_MENU_ENTRIES);
    return {};
}
