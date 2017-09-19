import {
    ClientStorageHandler,
    SocketEvent,
    MainMenuEvent,
    MainMenuEntriesResult
} from '@kix/core/dist/model/client';
import { SocketListener } from '@kix/core/dist/model/client/socket/SocketListener';
import { MAIN_MENU_LOAD_ENTRIES, MAIN_MENU_ENTRIES_LOADED } from '../store/actions';

declare var io: any;

export class MainMenuSocketListener extends SocketListener {

    private socket: SocketIO.Server;

    private store: any;

    public constructor() {
        super();

        this.socket = this.createSocket("main-menu");
        this.store = require('../store/');
        this.initSocketListener(this.socket);
    }

    private initSocketListener(socket: SocketIO.Server): void {
        socket.on(SocketEvent.CONNECT, () => {
            this.store.dispatch(MAIN_MENU_LOAD_ENTRIES(socket));
        });

        socket.on(SocketEvent.CONNECT_ERROR, (error) => {
            console.error(error);
        });

        socket.on(SocketEvent.CONNECT_TIMEOUT, () => {
            console.error("Timeout");
        });

        socket.on(MainMenuEvent.MENU_ENTRIES_LOADED, (result: MainMenuEntriesResult) => {
            this.store.dispatch(MAIN_MENU_ENTRIES_LOADED(result.menuEntries));
        });

        socket.on('error', (error) => {
            console.error(error);
        });
    }
}
