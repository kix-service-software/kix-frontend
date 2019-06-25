import { MainMenuEntriesRequest, AdministrationEvent, AdminCategoriesResponse } from '../core/model';
import { SocketResponse } from '../core/common';
import { SocketNameSpace } from './SocketNameSpace';
import { AdminModuleService } from '../services';

export class AdministrationNamespace extends SocketNameSpace {

    private static INSTANCE: AdministrationNamespace;

    public static getInstance(): AdministrationNamespace {
        if (!AdministrationNamespace.INSTANCE) {
            AdministrationNamespace.INSTANCE = new AdministrationNamespace();
        }
        return AdministrationNamespace.INSTANCE;
    }

    private constructor() {
        super();
    }

    protected getNamespace(): string {
        return 'administration';
    }

    protected registerEvents(client: SocketIO.Socket): void {
        this.registerEventHandler(
            client, AdministrationEvent.LOAD_ADMIN_CATEGORIES, this.loadAdminCategories.bind(this)
        );
    }

    private async loadAdminCategories(
        data: MainMenuEntriesRequest
    ): Promise<SocketResponse<AdminCategoriesResponse>> {
        const categories = await AdminModuleService.getInstance().getAdminModules(data.token);
        const response = new AdminCategoriesResponse(data.requestId, categories);
        return new SocketResponse(AdministrationEvent.ADMIN_CATEGORIES_LOADED, response);
    }

}
