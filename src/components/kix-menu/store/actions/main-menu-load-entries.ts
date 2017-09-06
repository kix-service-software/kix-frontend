import { StateAction } from './../../../../model/client/store/StateAction';
import { MainMenuAction } from './MainMenuAction';
import { MainMenuEvent } from '../../../../model/client/socket/main-menu';

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
