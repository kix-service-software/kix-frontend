import { CustomerComponentState } from './model/ComponentState';
import { ClientStorageHandler } from '@kix/core/dist/browser/ClientStorageHandler';
import { BreadcrumbDetails } from '@kix/core/dist/browser/router';
import { KIXRouterStore } from '@kix/core/dist/browser/router/KIXRouterStore';

class CustomersComponent {

    public state: CustomerComponentState;

    public store: any;

    public onCreate(input: any): void {
        this.state = new CustomerComponentState();
    }

    public onMount(): void {
        const contextId = ClientStorageHandler.getContextId();
        const breadcrumbDetails =
            new BreadcrumbDetails(contextId, null, null, 'Customer-Dashboard', null, null);
        KIXRouterStore.getInstance().prepareBreadcrumbDetails(breadcrumbDetails);
    }

}

module.exports = CustomersComponent;
