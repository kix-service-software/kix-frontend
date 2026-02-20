import { RequestMethod } from '../../../../server/model/rest/RequestMethod';
import { AdminModule } from '../../modules/admin/model/AdminModule';
import { APIClient } from '../APIClient';

export class AdminAPIClient extends APIClient {

    private static adminModules: Array<AdminModule>;

    public static async getAdminModule(id: string): Promise<AdminModule> {
        const categories = await this.loadAdminCategories();
        const module = this.findModule(id, categories);
        return module;
    }

    private static findModule(id: string, modules: Array<AdminModule>): AdminModule {
        for (const m of modules) {
            if (m.id === id) {
                return m;
            }

            const module = this.findModule(id, m.children);
            if (module) {
                return module;
            }
        }

        return null;
    }

    public static async loadAdminCategories(): Promise<Array<AdminModule>> {
        if (this.adminModules) {
            return this.adminModules;
        }

        const response = await this.executeRequest(RequestMethod.GET, '/admin/modules');
        const result = await response.json();
        const categories = result.modules.map((m) => new AdminModule(m));
        this.adminModules = categories;
        return categories;
    }

    public static clearAdminModuleCache(): void {
        this.adminModules = null;
    }

}