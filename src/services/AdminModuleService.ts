import { PluginService } from "./PluginService";
import { KIXExtensions } from "../core/extensions";
import { AdminModuleCategory, IAdminModuleExtension, AdminModule } from "../core/model";
import { PermissionService } from "./PermissionService";

export class AdminModuleService {

    private static INSTANCE: AdminModuleService;

    public static getInstance(): AdminModuleService {
        if (!AdminModuleService.INSTANCE) {
            AdminModuleService.INSTANCE = new AdminModuleService();
        }
        return AdminModuleService.INSTANCE;
    }

    private constructor() { }

    public async getAdminModuls(token: string): Promise<AdminModuleCategory[]> {
        const moduleExtensions = await PluginService.getInstance().getExtensions<IAdminModuleExtension>(
            KIXExtensions.ADMIN_MODULE
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
            category.children.forEach((c) => this.mergeCategory(existingCategory.children, c));
            category.modules.forEach((m) => existingCategory.modules.push(m));
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
