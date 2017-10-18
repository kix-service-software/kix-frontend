import {
    ClientStorageHandler,
    PersonalSettingsEvent,
    LoadPersonalSettingsRequest,
    StateAction
} from '@kix/core/dist/model/client';
import { PersonalSettingsAction } from './PersonalSettingsAction';

export default (socket: SocketIO.Server) => {
    const payload = new Promise((resolve, reject) => {
        resolve(loadEntries(socket));
    });

    return new StateAction(PersonalSettingsAction.LOAD_PERSONAL_SETTINGS, payload);
};

function loadEntries(socket: SocketIO.Server): any {
    const request = new LoadPersonalSettingsRequest(ClientStorageHandler.getToken());
    socket.emit(PersonalSettingsEvent.LOAD_PERSONAL_SETTINGS, request);
    return {};
}
