/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IServer } from './model/IServer';

export class ServerManager {

    private static INSTANCE: ServerManager;

    public static getInstance(): ServerManager {
        if (!ServerManager.INSTANCE) {
            ServerManager.INSTANCE = new ServerManager();
        }
        return ServerManager.INSTANCE;
    }

    private constructor() { }

    private servers: IServer[] = [];

    public registerServer(server: IServer): void {
        this.servers.push(server);
    }

    public getServers(): IServer[] {
        return this.servers || [];
    }

}