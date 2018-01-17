import { CustomersComponentState } from './model/CustomersComponentState';
import { BreadcrumbDetails } from '@kix/core/dist/browser/router';
import { ComponentRouterStore } from '@kix/core/dist/browser/router/ComponentRouterStore';
import { ContextService } from '@kix/core/dist/browser/context/ContextService';
import { Context } from '@kix/core/dist/model';

class CustomersComponent {

    public state: CustomersComponentState;

    public store: any;

    public onCreate(input: any): void {
        this.state = new CustomersComponentState();
    }

    public onMount(): void {
        ContextService.getInstance().provideContext(new Context('customers', 'customers'), 'customers', true);

        const breadcrumbDetails =
            new BreadcrumbDetails('customers', null, null, 'Customer-Dashboard');
        ComponentRouterStore.getInstance().prepareBreadcrumbDetails(breadcrumbDetails);
    }

}

module.exports = CustomersComponent;
