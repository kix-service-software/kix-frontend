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