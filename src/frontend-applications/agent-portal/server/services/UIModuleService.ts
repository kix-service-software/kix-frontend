/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { PluginService } from '../../../../server/services/PluginService';
import { IKIXModuleExtension } from '../../model/IKIXModuleExtension';
import { UIComponent } from '../../model/UIComponent';
import { AgentPortalExtensions } from '../extensions/AgentPortalExtensions';
import { PermissionService } from './PermissionService';

export class UIModuleService {

    public static async getUIModules(token: string, application: string = 'agent-portal'): Promise<IKIXModuleExtension[]> {
        let modules = await PluginService.getInstance().getExtensions<IKIXModuleExtension>(
            AgentPortalExtensions.MODULES
        );
        modules = modules.filter(
            (m) => !m.applications.length || m.applications.some((a) => a === application)
        );

        const createPromises: Array<Promise<IKIXModuleExtension>> = [];
        for (const uiModule of modules) {
            createPromises.push(this.createUIModule(token, uiModule));
        }

        const uiModules = await Promise.all(createPromises);
        return uiModules;
    }

    private static async createUIModule(token: string, uiModule: IKIXModuleExtension): Promise<IKIXModuleExtension> {
        const initComponents = uiModule.initComponents?.filter((c) => c.permissions.length === 0);
        const initComponentsToCheck = uiModule.initComponents.filter((c) => c.permissions.length > 0);
        if (initComponentsToCheck?.length > 0) {
            const allowedInitComponentes = await this.filterUIComponents(token, initComponentsToCheck);
            initComponents.push(...allowedInitComponentes);
        }

        const uiComponents = uiModule.uiComponents.filter((c) => c.permissions.length === 0);
        const uiComponentsToCheck = uiModule.uiComponents.filter((c) => c.permissions.length > 0);
        if (uiComponentsToCheck?.length > 0) {
            const allowedComponents = await this.filterUIComponents(token, uiComponentsToCheck);
            uiComponents.push(...allowedComponents);
        }

        return {
            id: uiModule.id,
            external: uiModule.external,
            initComponents,
            uiComponents,
            webDependencies: uiModule.webDependencies,
            applications: uiModule.applications
        };
    }

    private static async filterUIComponents(token: string, uiComponents: UIComponent[]): Promise<UIComponent[]> {
        const promises: Array<Promise<UIComponent>> = [];
        for (const component of uiComponents) {
            promises.push(new Promise<UIComponent>((resolve, reject) => {
                PermissionService.getInstance().checkPermissions(token, component.permissions, 'ApplicationRouter')
                    .then((allowed: boolean) => allowed ? resolve(component) : reject())
                    .catch((e) => reject());
            }));
        }

        const result = await Promise.allSettled(promises);
        return result.filter((c) => c.status === 'fulfilled').map((c) => c.value);
    }

}