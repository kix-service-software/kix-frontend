import { SocketClient } from "../SocketClient";
import {
    AdminModuleCategory, AdministrationEvent, AdminCategoriesResponse, ISocketRequest, SocketEvent
} from "../../model";
import { ClientStorageService } from "../ClientStorageService";
import { IdService } from "../IdService";
import { SocketErrorResponse } from "../../common";

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

        return new Promise<AdminModuleCategory[]>((resolve, reject) => {

            const requestId = IdService.generateDateBasedId();

            const timeout = window.setTimeout(() => {
                reject('Timeout: ' + AdministrationEvent.LOAD_ADMIN_CATEGORIES);
            }, 30000);

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
