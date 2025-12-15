/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { SocketClient } from '../../../../modules/base-components/webapp/core/SocketClient';
import { IdService } from '../../../../model/IdService';
import { AdministrationEvent } from '../../model/AdministrationEvent';
import { AdminCategoriesResponse } from '../../model/AdminCategoriesResponse';
import { SocketEvent } from '../../../../modules/base-components/webapp/core/SocketEvent';
import { SocketErrorResponse } from '../../../../modules/base-components/webapp/core/SocketErrorResponse';
import { ISocketRequest } from '../../../../modules/base-components/webapp/core/ISocketRequest';
import { ClientStorageService } from '../../../../modules/base-components/webapp/core/ClientStorageService';
import { AdminModule } from '../../model/AdminModule';

export class AdministrationSocketClient extends SocketClient {

    private static INSTANCE: AdministrationSocketClient;

    public static getInstance(): AdministrationSocketClient {
        if (!AdministrationSocketClient.INSTANCE) {
            AdministrationSocketClient.INSTANCE = new AdministrationSocketClient();
        }

        return AdministrationSocketClient.INSTANCE;
    }

    private constructor() {
        super('administration');
    }

    private adminModules: Array<AdminModule>;

    public async getAdminModule(id: string): Promise<AdminModule> {
        this.checkSocketConnection();
        const categories = await this.loadAdminCategories();
        const module = this.findModule(id, categories);
        return module;
    }

    public clearAdminModuleCache(): void {
        this.adminModules = null;
    }

    private findModule(id: string, modules: Array<AdminModule>): AdminModule {
        for (const m of modules) {
            if (m.id === id) {
                return m;
            }

            const module = this.findModule(id, m.children);
            if (module) {
                return module;
            }
        }

        return null;
    }

    public async loadAdminCategories(): Promise<Array<AdminModule>> {
        if (this.adminModules) {
            return this.adminModules;
        }

        this.checkSocketConnection();

        return new Promise<Array<AdminModule>>((resolve, reject) => {
            const requestId = IdService.generateDateBasedId();

            this.socket.on(
                AdministrationEvent.ADMIN_CATEGORIES_LOADED,
                (result: AdminCategoriesResponse) => {
                    if (result.requestId === requestId) {
                        const categories = result.modules.map((m) => new AdminModule(m));
                        this.adminModules = categories;
                        resolve(categories);
                    }
                }
            );

            this.socket.on(SocketEvent.ERROR, (error: SocketErrorResponse) => {
                if (error.requestId === requestId) {
                    console.error(error.error);
                    reject(error.error);
                }
            });

            const request: ISocketRequest = {
                requestId,
                clientRequestId: ClientStorageService.getClientRequestId()
            };

            this.socket.emit(AdministrationEvent.LOAD_ADMIN_CATEGORIES, request);
        });
    }

}
