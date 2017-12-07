import { CmdbComponentState } from './model/CmdbComponentState';
import { ClientStorageHandler } from '@kix/core/dist/browser/ClientStorageHandler';
import { BreadcrumbDetails } from '@kix/core/dist/browser/router';
import { ComponentRouterStore } from '@kix/core/dist/browser/router/ComponentRouterStore';

class CMDBComponent {

    public state: CmdbComponentState;

    public store: any;

    public onCreate(input: any): void {
        this.state = new CmdbComponentState();
    }

    public onMount(): void {
        const contextId = ClientStorageHandler.getContextId();
        const breadcrumbDetails =
            new BreadcrumbDetails(contextId, null, null, 'CMDB-Dashboard');
        ComponentRouterStore.getInstance().prepareBreadcrumbDetails(breadcrumbDetails);
    }

}

module.exports = CMDBComponent;
