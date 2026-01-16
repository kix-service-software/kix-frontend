/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IKIXModuleExtension } from '../../../../model/IKIXModuleExtension';
import { AuthenticationSocketClient } from '../../../base-components/webapp/core/AuthenticationSocketClient';
import { BrowserUtil } from '../../../base-components/webapp/core/BrowserUtil';
import { ContextHistory } from '../../../base-components/webapp/core/ContextHistory';
import { ContextService } from '../../../base-components/webapp/core/ContextService';
import { KIXModulesService } from '../../../base-components/webapp/core/KIXModulesService';
import { ClientNotificationSocketClient } from '../../../notification/webapp/core/ClientNotificationSocketClient';
import { PortalNotificationService } from '../../../portal-notification/webapp/core/PortalNotificationService';

export class AgentPortalService {

    private static modules: IKIXModuleExtension[];

    public static async initApplication(modules: IKIXModuleExtension[]): Promise<void> {
        this.modules = modules;
        // set base for relative links
        this.setBaseLink();

        await this.checkAuthentication();

        await ContextService.getInstance().initialize();
        ClientNotificationSocketClient.getInstance();
        PortalNotificationService.getInstance();
        ContextHistory.getInstance();
        BrowserUtil.handleBeforeUnload();

        await KIXModulesService.getInstance().init(this.modules);
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
        if (!AuthenticationSocketClient.getInstance().validateToken()) {
            window.location.replace('/auth');
        }
    }

}