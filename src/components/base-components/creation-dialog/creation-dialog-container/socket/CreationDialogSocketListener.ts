import {
    ClientStorageHandler,
    SocketEvent,
    CreationDialogEvent,
    LoadCreationDialogResponse
} from '@kix/core/dist/model/client';
import { SocketListener } from '@kix/core/dist/model/client/socket/SocketListener';
import { LOAD_CREATION_DIALOGS, CREATION_DIALOGS_LOADED } from '../store/actions';

export class CreationDialogSocketListener extends SocketListener {

    private socket: SocketIO.Server;

    private store: any;

    public constructor(store: any) {
        super();

        this.socket = this.createSocket("creation-dialog");
        this.store = store;
        this.initSocketListener();
    }

    private initSocketListener(): void {
        this.socket.on(SocketEvent.CONNECT, () => {
            this.store.dispatch(LOAD_CREATION_DIALOGS(this.socket));
        });

        this.socket.on(SocketEvent.CONNECT_ERROR, (error) => {
            console.error(error);
            this.socket.close();
        });

        this.socket.on(SocketEvent.CONNECT_TIMEOUT, () => {
            console.error("Timeout");
            this.socket.close();
        });

        this.socket.on(CreationDialogEvent.CREATION_DIALOGS_LOADED, (response: LoadCreationDialogResponse) => {
            this.store.dispatch(CREATION_DIALOGS_LOADED(response.creationDialogs));
        });

        this.socket.on('error', (error) => {
            console.error(error);
            this.socket.close();
        });
    }
}
