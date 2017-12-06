import { CMDBComponentState } from './model/ComponentState';
import { ClientStorageHandler } from '@kix/core/dist/browser/ClientStorageHandler';
import { BreadcrumbDetails } from '@kix/core/dist/browser/router';
import { KIXRouterStore } from '@kix/core/dist/browser/router/KIXRouterStore';

class CMDBComponent {

    public state: CMDBComponentState;

    public store: any;

    public onCreate(input: any): void {
        this.state = new CMDBComponentState();
    }

    public onMount(): void {
        const contextId = ClientStorageHandler.getContextId();
        const breadcrumbDetails =
            new BreadcrumbDetails(contextId, null, null, 'CMDB-Dashboard', null, null);
        KIXRouterStore.getInstance().prepareBreadcrumbDetails(breadcrumbDetails);
    }

}

module.exports = CMDBComponent;
