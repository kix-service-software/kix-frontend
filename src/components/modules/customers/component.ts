import { CustomerComponentState } from './model/ComponentState';
import { ClientStorageHandler } from '@kix/core/dist/browser/ClientStorageHandler';
import { BreadcrumbDetails } from '@kix/core/dist/browser/router';
import { ComponentRouterStore } from '@kix/core/dist/browser/router/ComponentRouterStore';

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
        ComponentRouterStore.getInstance().prepareBreadcrumbDetails(breadcrumbDetails);
    }

}

module.exports = CustomersComponent;
