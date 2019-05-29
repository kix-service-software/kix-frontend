import {
    SocketEvent, MainMenuEvent, MainMenuEntriesResponse, MainMenuEntriesRequest, MenuEntry
} from '../../core/model';
import { SocketClient } from '../../core/browser/SocketClient';
import { ClientStorageService, IdService } from '../../core/browser';

export class MainMenuSocketClient extends SocketClient {

    public static INSTANCE: MainMenuSocketClient;

    public static getInstance(): MainMenuSocketClient {
        if (!MainMenuSocketClient.INSTANCE) {
            MainMenuSocketClient.INSTANCE = new MainMenuSocketClient();
        }

        return MainMenuSocketClient.INSTANCE;
    }

    private constructor() {
        super();
        this.socket = this.createSocket("main-menu");
        this.initSocketListener();
    }

    private initSocketListener(): void {
        this.socket.on(SocketEvent.CONNECT_ERROR, (error) => {
            console.error(error);
            this.socket.close();
        });

        this.socket.on(SocketEvent.CONNECT_TIMEOUT, () => {
            console.error("Timeout");
            this.socket.close();
        });

        this.socket.on('error', (error) => {
            console.error(error);
            this.socket.close();
        });
    }

    public async loadMenuEntries(): Promise<[MenuEntry[], MenuEntry[], boolean]> {
        return new Promise<[MenuEntry[], MenuEntry[], boolean]>((resolve, reject) => {
            const timeout = window.setTimeout(() => {
                reject('Timeout: ' + MainMenuEvent.LOAD_MENU_ENTRIES);
            }, 30000);

            const token = ClientStorageService.getToken();
            const requestId = IdService.generateDateBasedId();

            this.socket.emit(
                MainMenuEvent.LOAD_MENU_ENTRIES, new MainMenuEntriesRequest(
                    token, requestId, ClientStorageService.getToken()
                )
            );

            this.socket.on(MainMenuEvent.MENU_ENTRIES_LOADED, (result: MainMenuEntriesResponse) => {
                if (requestId === result.requestId) {
                    window.clearTimeout(timeout);
                    resolve([result.primaryMenuEntries, result.secondaryMenuEntries, result.showText]);
                }
            });
        });

    }
}
