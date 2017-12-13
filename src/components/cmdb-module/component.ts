import { CmdbComponentState } from './model/CmdbComponentState';
import { ClientStorageHandler } from '@kix/core/dist/browser/ClientStorageHandler';
import { BreadcrumbDetails } from '@kix/core/dist/browser/router';
import { ComponentRouterStore } from '@kix/core/dist/browser/router/ComponentRouterStore';
import { DashboardStore } from '@kix/core/dist/browser/dashboard/DashboardStore';

class CMDBComponent {

    public state: CmdbComponentState;

    public store: any;

    public onCreate(input: any): void {
        this.state = new CmdbComponentState();
    }

    public onMount(): void {
        DashboardStore.getInstance().loadDashboardConfiguration();
        const contextId = ClientStorageHandler.getContextId();
        const breadcrumbDetails =
            new BreadcrumbDetails(contextId, null, null, 'CMDB-Dashboard');
        ComponentRouterStore.getInstance().prepareBreadcrumbDetails(breadcrumbDetails);
    }

}

module.exports = CMDBComponent;
