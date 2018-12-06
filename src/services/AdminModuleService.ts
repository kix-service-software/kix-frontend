import { PluginService } from "./PluginService";
import { KIXExtensions } from "@kix/core/dist/extensions";
import { AdminModuleCategory, IAdminModuleExtension } from "@kix/core/dist/model";

export class AdminModuleService {

    private static INSTANCE: AdminModuleService;

    public static getInstance(): AdminModuleService {
        if (!AdminModuleService.INSTANCE) {
            AdminModuleService.INSTANCE = new AdminModuleService();
        }
        return AdminModuleService.INSTANCE;
    }

    private constructor() { }

    public async getAdminModuls(): Promise<AdminModuleCategory[]> {
        const moduleExtensions = await PluginService.getInstance().getExtensions<IAdminModuleExtension>(
            KIXExtensions.ADMIN_MODULE
        );

        const categories: AdminModuleCategory[] = [];

        moduleExtensions.forEach((m) => {
            const moduleCategories = m.getAdminModules();
            moduleCategories.forEach((c) => this.mergeCategory(categories, c));
        });

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

}
