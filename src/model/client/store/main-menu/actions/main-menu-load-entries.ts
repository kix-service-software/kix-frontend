import { MainMenuEvent } from './../../../socket/main-menu/';
import { StateAction } from './../../StateAction';
import { MainMenuAction } from './MainMenuAction';

export default (socket: SocketIO.Server) => {
    const payload = new Promise((resolve, reject) => {
        resolve(loadEntries(socket));
    });

    return new StateAction(MainMenuAction.MAIN_MENU_LOAD_ENTRIES, payload);
};

function loadEntries(socket: SocketIO.Server): any {
    socket.emit(MainMenuEvent.LOAD_MENU_ENTRIES);
    return {};
}
