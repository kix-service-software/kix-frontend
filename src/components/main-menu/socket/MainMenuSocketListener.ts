import {
    ClientStorageHandler,
    SocketEvent,
    MainMenuEvent,
    MainMenuEntriesResponse
} from '@kix/core/dist/model/client';
import { SocketListener } from '@kix/core/dist/model/client/socket/SocketListener';
import { MAIN_MENU_LOAD_ENTRIES, MAIN_MENU_ENTRIES_LOADED } from '../store/actions';

export class MainMenuSocketListener extends SocketListener {

    private socket: SocketIO.Server;

    private store: any;

    public constructor() {
        super();

        this.socket = this.createSocket("main-menu");
        this.store = require('../store/');
        this.initSocketListener();
    }

    private initSocketListener(): void {
        this.socket.on(SocketEvent.CONNECT, () => {
            this.store.dispatch(MAIN_MENU_LOAD_ENTRIES(this.socket));
        });

        this.socket.on(SocketEvent.CONNECT_ERROR, (error) => {
            console.error(error);
            this.socket.close();
        });

        this.socket.on(SocketEvent.CONNECT_TIMEOUT, () => {
            console.error("Timeout");
            this.socket.close();
        });

        this.socket.on(MainMenuEvent.MENU_ENTRIES_LOADED, (result: MainMenuEntriesResponse) => {
            this.store.dispatch(
                MAIN_MENU_ENTRIES_LOADED(result.primaryMenuEntries, result.secondaryMenuEntries, result.showText)
            );
        });

        this.socket.on('error', (error) => {
            console.error(error);
            this.socket.close();
        });
    }
}
