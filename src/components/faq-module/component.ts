import { FaqComponentState } from './model/FaqComponentState';
import { ClientStorageHandler } from '@kix/core/dist/browser/ClientStorageHandler';
import { BreadcrumbDetails } from '@kix/core/dist/browser/router';
import { ComponentRouterStore } from '@kix/core/dist/browser/router/ComponentRouterStore';
import { DashboardStore } from '@kix/core/dist/browser/dashboard/DashboardStore';

class FAQComponent {

    public state: FaqComponentState;

    public store: any;

    public onCreate(input: any): void {
        this.state = new FaqComponentState();
    }

    public onMount(): void {
        DashboardStore.getInstance().loadDashboardConfiguration();
        const contextId = ClientStorageHandler.getContextId();
        const breadcrumbDetails =
            new BreadcrumbDetails(contextId, null, null, 'FAQ-Dashboard');
        ComponentRouterStore.getInstance().prepareBreadcrumbDetails(breadcrumbDetails);
    }
}

module.exports = FAQComponent;
