/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { PluginService } from '../../../../../server/services/PluginService';
import { IAdminModuleExtension } from './IAdminModuleExtension';
import { AdminModule } from '../model/AdminModule';
import { AgentPortalExtensions } from '../../../server/extensions/AgentPortalExtensions';
import { PermissionService } from '../../../server/services/PermissionService';

export class AdminModuleService {

    private static INSTANCE: AdminModuleService;

    public static getInstance(): AdminModuleService {
        if (!AdminModuleService.INSTANCE) {
            AdminModuleService.INSTANCE = new AdminModuleService();
        }
        return AdminModuleService.INSTANCE;
    }

    private constructor() { }

    public async getAdminModules(token: string): Promise<Array<AdminModule>> {
        const moduleExtensions = await PluginService.getInstance().getExtensions<IAdminModuleExtension>(
            AgentPortalExtensions.ADMIN_MODULE
        );

        let modules: AdminModule[] = [];

        for (const m of moduleExtensions) {
            const adminModules = m.getAdminModules();
            for (const c of adminModules) {
                await this.mergeModule(modules, c, token);
            }
        }

        modules = this.sortModules(modules);

        return modules;
    }

    private async mergeModule(
        categories: Array<AdminModule>, adminModule: AdminModule, token: string
    ): Promise<void> {
        let existingModule = categories.find((c) => c.id === adminModule.id);
        if (!existingModule) {
            existingModule = JSON.parse(JSON.stringify(adminModule));
            existingModule.children = [];

            let allowed = true;
            if (!existingModule.isCategory) {
                allowed = await PermissionService.getInstance().checkPermissions(
                    token, adminModule.permissions, null, null
                ).catch(() => false);
            }

            if (allowed) {
                categories.push(existingModule);
            }
        }

        if (adminModule.children?.length) {
            for (const c of adminModule.children) {
                await this.mergeModule(existingModule.children, c, token);
            }
        }

        if (existingModule.isCategory && !existingModule.children?.length) {
            const index = categories.findIndex((c) => c.id === existingModule.id);
            if (index !== -1) {
                categories.splice(index, 1);
            }
        }
    }

    private sortModules(modules: AdminModule[]): AdminModule[] {
        modules = modules.sort((a, b) => {
            if (a.isCategory && !b.isCategory) {
                return -1;
            } else if (!a.isCategory && b.isCategory) {
                return 1;
            }

            return a.name.localeCompare(b.name);
        });
        return modules;
    }

}
