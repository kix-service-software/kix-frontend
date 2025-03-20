/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { SocketClient } from '../../../../../../modules/base-components/webapp/core/SocketClient';
import { SocketEvent } from '../../../../../../modules/base-components/webapp/core/SocketEvent';
import { ClientStorageService } from '../../../../../../modules/base-components/webapp/core/ClientStorageService';
import { IdService } from '../../../../../../model/IdService';
import { MainMenuEvent } from '../../../../model/MainMenuEvent';
import { MainMenuEntriesResponse } from '../../../../model/MainMenuEntriesResponse';
import { SocketErrorResponse } from '../../../../../../modules/base-components/webapp/core/SocketErrorResponse';
import { MainMenuEntriesRequest } from '../../../../model/MainMenuEntriesRequest';

export class MainMenuSocketClient extends SocketClient {

    public static INSTANCE: MainMenuSocketClient;

    public static getInstance(): MainMenuSocketClient {
        if (!MainMenuSocketClient.INSTANCE) {
            MainMenuSocketClient.INSTANCE = new MainMenuSocketClient();
        }

        return MainMenuSocketClient.INSTANCE;
    }

    private constructor() {
        super('main-menu');
    }

    public async loadMenuEntries(): Promise<MainMenuEntriesResponse> {
        this.checkSocketConnection();

        const socketTimeout = ClientStorageService.getSocketTimeout();
        return new Promise<MainMenuEntriesResponse>((resolve, reject) => {
            const timeout = window.setTimeout(() => {
                reject('Timeout: ' + MainMenuEvent.LOAD_MENU_ENTRIES);
            }, socketTimeout);

            const requestId = IdService.generateDateBasedId();

            this.socket.on(MainMenuEvent.MENU_ENTRIES_LOADED, (result: MainMenuEntriesResponse) => {
                if (requestId === result.requestId) {
                    window.clearTimeout(timeout);
                    resolve(result);
                }
            });

            this.socket.on(SocketEvent.ERROR, (error: SocketErrorResponse) => {
                if (error.requestId === requestId) {
                    window.clearTimeout(timeout);
                    console.error(error.error);
                    reject(error.error);
                }
            });

            this.socket.emit(
                MainMenuEvent.LOAD_MENU_ENTRIES,
                new MainMenuEntriesRequest(requestId, ClientStorageService.getClientRequestId())
            );
        });

    }
}
