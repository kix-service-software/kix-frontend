import {
    ClientStorageHandler,
    CreationDialogEvent,
    LoadCreationDialogRequest,
    StateAction
} from '@kix/core/dist/model/client';
import { CreationDialogAction } from './CreationDialogAction';

export default (socket: SocketIO.Server) => {
    const payload = new Promise((resolve, reject) => {
        resolve(loadEntries(socket));
    });

    return new StateAction(CreationDialogAction.LOAD_CREATION_DIALOG, payload);
};

function loadEntries(socket: SocketIO.Server): any {
    const request = new LoadCreationDialogRequest(ClientStorageHandler.getToken());
    socket.emit(CreationDialogEvent.LOAD_CREATION_DIALOGS, request);
    return {};
}
