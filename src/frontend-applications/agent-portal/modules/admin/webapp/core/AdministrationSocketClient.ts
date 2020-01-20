/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { SocketClient } from "../../../../modules/base-components/webapp/core/SocketClient";
import { AdminModuleCategory } from "../../model/AdminModuleCategory";
import { IdService } from "../../../../model/IdService";
import { AdministrationEvent } from "../../model/AdministrationEvent";
import { AdminCategoriesResponse } from "../../model/AdminCategoriesResponse";
import { SocketEvent } from "../../../../modules/base-components/webapp/core/SocketEvent";
import { SocketErrorResponse } from "../../../../modules/base-components/webapp/core/SocketErrorResponse";
import { ISocketRequest } from "../../../../modules/base-components/webapp/core/ISocketRequest";
import { ClientStorageService } from "../../../../modules/base-components/webapp/core/ClientStorageService";

export class AdministrationSocketClient extends SocketClient {

    private static INSTANCE: AdministrationSocketClient;

    public static getInstance(): AdministrationSocketClient {
        if (!AdministrationSocketClient.INSTANCE) {
            AdministrationSocketClient.INSTANCE = new AdministrationSocketClient();
        }

        return AdministrationSocketClient.INSTANCE;
    }

    private constructor() {
        super();
        this.socket = this.createSocket('administration', true);
    }

    private categories: AdminModuleCategory[];

    public async loadAdminCategories(): Promise<AdminModuleCategory[]> {
        if (this.categories) {
            return this.categories;
        }

        const socketTimeout = ClientStorageService.getSocketTimeout();

        return new Promise<AdminModuleCategory[]>((resolve, reject) => {
            const requestId = IdService.generateDateBasedId();

            const timeout = window.setTimeout(() => {
                reject('Timeout: ' + AdministrationEvent.LOAD_ADMIN_CATEGORIES);
            }, socketTimeout);

            this.socket.on(
                AdministrationEvent.ADMIN_CATEGORIES_LOADED,
                (result: AdminCategoriesResponse) => {
                    if (result.requestId === requestId) {
                        window.clearTimeout(timeout);
                        const categories = result.categories.map((c) => new AdminModuleCategory(c));
                        this.categories = categories;
                        resolve(categories);
                    }
                }
            );

            this.socket.on(SocketEvent.ERROR, (error: SocketErrorResponse) => {
                if (error.requestId === requestId) {
                    window.clearTimeout(timeout);
                    console.error(error.error);
                    reject(error.error);
                }
            });

            const request: ISocketRequest = {
                token: ClientStorageService.getToken(),
                requestId,
                clientRequestId: ClientStorageService.getClientRequestId()
            };

            this.socket.emit(AdministrationEvent.LOAD_ADMIN_CATEGORIES, request);
        });
    }

}
