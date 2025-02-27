/**
 * Copyright (C) 2006-2025 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { SocketNameSpace } from '../../../server/socket-namespaces/SocketNameSpace';
import { MainMenuEntriesRequest } from '../../agent-portal/model/MainMenuEntriesRequest';
import { SocketResponse } from '../../../modules/base-components/webapp/core/SocketResponse';
import { SocketEvent } from '../../../modules/base-components/webapp/core/SocketEvent';
import { SocketErrorResponse } from '../../../modules/base-components/webapp/core/SocketErrorResponse';
import { ISocketRequest } from '../../../modules/base-components/webapp/core/ISocketRequest';
import { PluginService } from '../../../../../server/services/PluginService';
import { MarkoService } from '../../../server/services/MarkoService';
import { AdministrationEvent } from '../model/AdministrationEvent';
import { AdminCategoriesResponse } from '../model/AdminCategoriesResponse';
import { AdminModuleService } from './AdminModuleService';
import { AdminModule } from '../model/AdminModule';
import { Socket } from 'socket.io';
import cookie from 'cookie';

export class AdministrationNamespace extends SocketNameSpace {

    private static INSTANCE: AdministrationNamespace;

    public static getInstance(): AdministrationNamespace {
        if (!AdministrationNamespace.INSTANCE) {
            AdministrationNamespace.INSTANCE = new AdministrationNamespace();
        }
        return AdministrationNamespace.INSTANCE;
    }

    private constructor() {
        super();
    }

    protected getNamespace(): string {
        return 'administration';
    }

    protected registerEvents(client: Socket): void {
        this.registerEventHandler(
            client, AdministrationEvent.LOAD_ADMIN_CATEGORIES, this.loadAdminCategories.bind(this)
        );
        this.registerEventHandler(
            client, AdministrationEvent.UPDATE_FRONTEND, this.updateFrontend.bind(this)
        );
    }

    private async loadAdminCategories(data: MainMenuEntriesRequest, client: Socket): Promise<SocketResponse> {
        const parsedCookie = client ? cookie.parse(client.handshake.headers.cookie) : null;

        const tokenPrefix = client?.handshake?.headers?.tokenprefix || '';
        const token = parsedCookie ? parsedCookie[`${tokenPrefix}token`] : '';

        const adminCategoryResponse = await AdminModuleService.getInstance().getAdminModules(token)
            .then((modules: Array<AdminModule>) =>
                new SocketResponse(
                    AdministrationEvent.ADMIN_CATEGORIES_LOADED,
                    new AdminCategoriesResponse(data.requestId, modules)
                )
            )
            .catch(
                (error) => new SocketResponse(SocketEvent.ERROR, new SocketErrorResponse(data.requestId, error))
            );
        return adminCategoryResponse;
    }

    private async updateFrontend(data: ISocketRequest): Promise<SocketResponse> {
        PluginService.getInstance().scanPlugins();
        await MarkoService.getInstance().initializeMarkoApplications();
        const response = new SocketResponse(AdministrationEvent.FRONTEND_UPDATED, { requestId: data.requestId, });
        return response;
    }

}
