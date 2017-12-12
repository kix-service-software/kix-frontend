import { SearchComponentState } from './model/SearchComponentState';
import { ClientStorageHandler } from '@kix/core/dist/browser/ClientStorageHandler';
import { BreadcrumbDetails } from '@kix/core/dist/browser/router';
import { ComponentRouterStore } from '@kix/core/dist/browser/router/ComponentRouterStore';
import { DashboardStore } from '@kix/core/dist/browser/dashboard/DashboardStore';

class SearchComponent {

    public state: SearchComponentState;

    public store: any;

    public onCreate(input: any): void {
        this.state = new SearchComponentState();
    }

    public onMount(): void {
        DashboardStore.getInstance().loadDashboardConfiguration();
        const contextId = ClientStorageHandler.getContextId();
        const breadcrumbDetails =
            new BreadcrumbDetails(contextId, null, null, 'Search-Dashboard');
        ComponentRouterStore.getInstance().prepareBreadcrumbDetails(breadcrumbDetails);
    }

}

module.exports = SearchComponent;
