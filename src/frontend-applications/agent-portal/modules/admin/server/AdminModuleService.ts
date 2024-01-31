/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AdminModuleCategory } from '../model/AdminModuleCategory';
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

    public async getAdminModules(token: string): Promise<Array<AdminModuleCategory | AdminModule>> {
        const moduleExtensions = await PluginService.getInstance().getExtensions<IAdminModuleExtension>(
            AgentPortalExtensions.ADMIN_MODULE
        );

        const categories: AdminModuleCategory[] = [];

        for (const m of moduleExtensions) {
            const moduleCategories = m.getAdminModules();
            for (const c of moduleCategories) {
                await this.mergeCategory(categories, c, token);
            }
        }

        return categories;
    }

    private async mergeCategory(
        categories: Array<AdminModuleCategory | AdminModule>, module: AdminModuleCategory | AdminModule,
        token: string
    ): Promise<void> {
        if (module instanceof AdminModuleCategory) {
            let category = categories.find((c) => c.id === module.id) as AdminModuleCategory;
            if (!category) {
                category = JSON.parse(JSON.stringify(module));
                category.children = [];
                category.modules = [];
                categories.push(category);
            }

            if (module.children) {
                if (!category.children) {
                    category.children = [];
                }
                for (const c of module.children) {
                    await this.mergeCategory(category.children, c, token);
                }
            }

            if (module.modules) {
                if (!category.modules) {
                    category.modules = [];
                }

                for (const m of module.modules) {

                    const allowed = await PermissionService.getInstance().checkPermissions(
                        token, m.permissions, null, null
                    ).catch(() => false);

                    if (allowed) {
                        category.modules.push(m);
                    }
                }
            }

            if (!category.children?.length && !category.modules?.length) {
                const index = categories.findIndex((c) => c.id === category.id);
                if (index !== -1) {
                    categories.splice(index, 1);
                }
            }
        } else {
            const allowed = await PermissionService.getInstance().checkPermissions(
                token, module.permissions, null, null
            ).catch(() => false);

            if (allowed) {
                categories.push(module);
            }
        }
    }

}
