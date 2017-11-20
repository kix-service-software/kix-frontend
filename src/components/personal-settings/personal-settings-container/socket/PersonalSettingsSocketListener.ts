import {
    SocketEvent,
    PersonalSettingsEvent,
    PersonalSettingsConfiguration,
    LoadPersonalSettingsResponse,
    LoadPersonalSettingsRequest,
    SavePersonalSettingsRequest
} from '@kix/core/dist/model';
import { ClientStorageHandler } from '@kix/core/dist/browser/ClientStorageHandler';
import { SocketListener } from '@kix/core/dist/browser/SocketListener';
import { PERSONAL_SETTINGS_LOADED } from '../store/actions';

export class PersonalSettingsSocketListener extends SocketListener {

    private socket: SocketIO.Server;

    private store: any;

    public constructor(store: any) {
        super();

        this.socket = this.createSocket("personal-settings");
        this.store = store;
        this.initSocketListener();
    }

    public savePersonalSettings(personalSettings: PersonalSettingsConfiguration[]): Promise<void> {
        return new Promise((resolve, reject) => {
            const token = ClientStorageHandler.getToken();
            const request = new SavePersonalSettingsRequest(token, personalSettings);
            this.socket.emit(PersonalSettingsEvent.SAVE_PERSONAL_SETTINGS, request);

            this.socket.on(PersonalSettingsEvent.PERSONAL_SETTINGS_SAVED, () => {
                resolve();
            });
        });
    }

    private initSocketListener(): void {
        this.socket.on(SocketEvent.CONNECT, () => {
            const request = new LoadPersonalSettingsRequest(ClientStorageHandler.getToken());
            this.socket.emit(PersonalSettingsEvent.LOAD_PERSONAL_SETTINGS, request);
        });

        this.socket.on(SocketEvent.CONNECT_ERROR, (error) => {
            console.error(error);
            this.socket.close();
        });

        this.socket.on(SocketEvent.CONNECT_TIMEOUT, () => {
            console.error("Timeout");
            this.socket.close();
        });

        this.socket.on(PersonalSettingsEvent.PERSONAL_SETTINGS_LOADED, (response: LoadPersonalSettingsResponse) => {
            this.store.dispatch(PERSONAL_SETTINGS_LOADED(response.personalSettings));
        });

        this.socket.on('error', (error) => {
            console.error(error);
            this.socket.close();
        });
    }
}
