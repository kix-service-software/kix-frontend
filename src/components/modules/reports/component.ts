import { ReportsComponentState } from './model/ComponentState';
import { ClientStorageHandler } from '@kix/core/dist/browser/ClientStorageHandler';
import { BreadcrumbDetails } from '@kix/core/dist/browser/router';
import { ComponentRouterStore } from '@kix/core/dist/browser/router/ComponentRouterStore';
import { DashboardStore } from '@kix/core/dist/browser/dashboard/DashboardStore';

class ReportsComponent {

    public state: ReportsComponentState;

    public store: any;

    public onCreate(input: any): void {
        this.state = new ReportsComponentState();
    }

    public onMount(): void {
        DashboardStore.getInstance().loadDashboardConfiguration();
        const contextId = ClientStorageHandler.getContextId();
        const breadcrumbDetails =
            new BreadcrumbDetails(contextId, null, null, 'Reports-Dashboard');
        ComponentRouterStore.getInstance().prepareBreadcrumbDetails(breadcrumbDetails);
    }

}

module.exports = ReportsComponent;
