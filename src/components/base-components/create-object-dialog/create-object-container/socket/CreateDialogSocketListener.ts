import {
    ClientStorageHandler,
    SocketEvent,
    CreateDialogEvent,
    LoadCreateDialogResponse
} from '@kix/core/dist/model/client';
import { SocketListener } from '@kix/core/dist/model/client/socket/SocketListener';
import { LOAD_DIALOGS, DIALOGS_LOADED } from '../store/actions';

export class CreateDialogSocketListener extends SocketListener {

    private socket: SocketIO.Server;

    private store: any;

    public constructor(store: any) {
        super();

        this.socket = this.createSocket("create-dialog");
        this.store = store;
        this.initSocketListener();
    }

    private initSocketListener(): void {
        this.socket.on(SocketEvent.CONNECT, () => {
            this.store.dispatch(LOAD_DIALOGS(this.socket));
        });

        this.socket.on(SocketEvent.CONNECT_ERROR, (error) => {
            console.error(error);
        });

        this.socket.on(SocketEvent.CONNECT_TIMEOUT, () => {
            console.error("Timeout");
        });

        this.socket.on(CreateDialogEvent.CREATE_DIALOGS_LOADED, (response: LoadCreateDialogResponse) => {
            this.store.dispatch(DIALOGS_LOADED(response.createDialogs));
        });

        this.socket.on('error', (error) => {
            console.error(error);
        });
    }
}
