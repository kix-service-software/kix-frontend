import {
    SocketEvent, MainMenuEvent, MainMenuEntriesResponse, MainMenuEntriesRequest, MenuEntry
} from '@kix/core/dist/model';
import { SocketListener } from '@kix/core/dist/browser/SocketListener';
import { ClientStorageService } from '@kix/core/dist/browser';

export class MainMenuSocketListener extends SocketListener {

    public static INSTANCE: MainMenuSocketListener;

    public static getInstance(): MainMenuSocketListener {
        if (!MainMenuSocketListener.INSTANCE) {
            MainMenuSocketListener.INSTANCE = new MainMenuSocketListener();
        }

        return MainMenuSocketListener.INSTANCE;
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

            this.socket.emit(
                MainMenuEvent.LOAD_MENU_ENTRIES, new MainMenuEntriesRequest(ClientStorageService.getToken())
            );

            this.socket.on(MainMenuEvent.MENU_ENTRIES_LOADED, (result: MainMenuEntriesResponse) => {
                resolve([result.primaryMenuEntries, result.secondaryMenuEntries, result.showText]);
            });
        });

    }
}
