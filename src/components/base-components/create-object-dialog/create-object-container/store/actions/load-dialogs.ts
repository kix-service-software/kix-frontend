import {
    ClientStorageHandler,
    CreateDialogEvent,
    LoadCreateDialogRequest,
    StateAction
} from '@kix/core/dist/model/client';
import { CreateDialogAction } from './CreateDialogAction';

export default (socket: SocketIO.Server) => {
    const payload = new Promise((resolve, reject) => {
        resolve(loadEntries(socket));
    });

    return new StateAction(CreateDialogAction.LOAD_CREATE_DIALOG, payload);
};

function loadEntries(socket: SocketIO.Server): any {
    const request = new LoadCreateDialogRequest(ClientStorageHandler.getToken());
    socket.emit(CreateDialogEvent.LOAD_CREATE_DIALOGS, request);
    return {};
}
