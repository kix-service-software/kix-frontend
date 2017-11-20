import { MainMenuEvent, MainMenuEntriesRequest } from '@kix/core/dist/model';
import { MainMenuAction } from './MainMenuAction';
import { StateAction } from '@kix/core/dist/browser/StateAction';
import { ClientStorageHandler } from '@kix/core/dist/browser/ClientStorageHandler';

export default (socket: SocketIO.Server) => {
    const payload = new Promise((resolve, reject) => {
        resolve(loadEntries(socket));
    });

    return new StateAction(MainMenuAction.MAIN_MENU_LOAD_ENTRIES, payload);
};

function loadEntries(socket: SocketIO.Server): any {
    socket.emit(MainMenuEvent.LOAD_MENU_ENTRIES, new MainMenuEntriesRequest(ClientStorageHandler.getToken()));
    return {};
}
