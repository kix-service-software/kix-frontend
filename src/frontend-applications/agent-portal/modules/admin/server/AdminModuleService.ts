/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AdminModuleCategory } from "../model/AdminModuleCategory";
import { PluginService } from "../../../../../server/services/PluginService";
import { IAdminModuleExtension } from "./IAdminModuleExtension";
import { AdminModule } from "../model/AdminModule";
import { PermissionService } from "../../../server/services/PermissionService";
import { AgentPortalExtensions } from "../../../server/extensions/AgentPortalExtensions";

export class AdminModuleService {

    private static INSTANCE: AdminModuleService;

    public static getInstance(): AdminModuleService {
        if (!AdminModuleService.INSTANCE) {
            AdminModuleService.INSTANCE = new AdminModuleService();
        }
        return AdminModuleService.INSTANCE;
    }

    private constructor() { }

    public async getAdminModules(token: string): Promise<AdminModuleCategory[]> {
        const moduleExtensions = await PluginService.getInstance().getExtensions<IAdminModuleExtension>(
            AgentPortalExtensions.ADMIN_MODULE
        );

        let categories: AdminModuleCategory[] = [];

        moduleExtensions.forEach((m) => {
            const moduleCategories = m.getAdminModules();
            moduleCategories.forEach((c) => this.mergeCategory(categories, c));
        });

        categories = await this.checkPermissions(token, categories);

        return categories;
    }

    private mergeCategory(categories: AdminModuleCategory[], category: AdminModuleCategory): void {
        const existingCategory = categories.find((c) => c.id === category.id);
        if (existingCategory) {
            if (category.children) {
                if (!existingCategory.children) {
                    existingCategory.children = [];
                }
                category.children.forEach((c) => this.mergeCategory(existingCategory.children, c));
            }

            if (category.modules) {
                if (!existingCategory.modules) {
                    existingCategory.modules = [];
                }
                category.modules.forEach((m) => existingCategory.modules.push(m));
            }
        } else {
            categories.push(category);
        }
    }

    private async checkPermissions(token: string, categories: AdminModuleCategory[]): Promise<AdminModuleCategory[]> {
        const result: AdminModuleCategory[] = [];
        for (const category of categories) {
            const modules: AdminModule[] = [];

            if (category.modules) {
                for (const adminModule of category.modules) {
                    const allowed = await PermissionService.getInstance().checkPermissions(
                        token, adminModule.permissions
                    );

                    if (allowed) {
                        modules.push(adminModule);
                    }
                }
            }

            category.modules = modules;

            if (category.children && category.children.length) {
                category.children = await this.checkPermissions(token, category.children);
            }

            if (category.modules.length || category.children.length) {
                result.push(category);
            }
        }

        return result;
    }

}
