/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { SessionAPIClient } from '../../../../api-client/session/Session';
import { IKIXModuleExtension } from '../../../../model/IKIXModuleExtension';
import { BrowserUtil } from '../../../base-components/webapp/core/BrowserUtil';
import { ClientStorageService } from '../../../base-components/webapp/core/ClientStorageService';
import { ContextHistory } from '../../../base-components/webapp/core/ContextHistory';
import { ContextService } from '../../../base-components/webapp/core/ContextService';
import { KIXModulesService } from '../../../base-components/webapp/core/KIXModulesService';
import { NotificationService } from '../../../notification/webapp/core';
import { PortalNotificationService } from '../../../portal-notification/webapp/core/PortalNotificationService';

export class AgentPortalService {

    private static modules: IKIXModuleExtension[];

    public static async initApplication(modules: IKIXModuleExtension[]): Promise<void> {
        this.modules = modules;
        // set base for relative links
        this.setBaseLink();

        await this.checkAuthentication();

        await ContextService.getInstance().initialize();
        PortalNotificationService.getInstance();
        ContextHistory.getInstance();
        BrowserUtil.handleBeforeUnload();

        await KIXModulesService.getInstance().init(this.modules);

        NotificationService.getInstance().registerNotificationServiceWorker();
    }

    private static setBaseLink(): void {
        if (window?.location?.origin) {
            const head = document.getElementsByTagName('head');
            if (head && head[0]) {
                const base = document.createElement('base');
                base.href = window?.location?.origin;
                head[0].appendChild(base);
            }
        }
    }

    private static async checkAuthentication(): Promise<void> {
        if (!SessionAPIClient.validateToken()) {
            window.location.replace('/auth');
        }

        const currentUser = await SessionAPIClient.getCurrentUser();
        ClientStorageService.setOption('UserId', currentUser?.UserID?.toString());
    }

}