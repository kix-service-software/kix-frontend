import { CustomersComponentState } from './model/CustomersComponentState';
import { ComponentRouterService } from '@kix/core/dist/browser/router/';
import { ContextService } from '@kix/core/dist/browser/context/ContextService';
import { BreadcrumbDetails, Context } from '@kix/core/dist/model';

class CustomersComponent {

    public state: CustomersComponentState;

    public store: any;

    public onCreate(input: any): void {
        this.state = new CustomersComponentState();
    }

    public onMount(): void {
        ContextService.getInstance().provideContext(new Context('customers', 'customers'), true);

        const breadcrumbDetails =
            new BreadcrumbDetails('customers', null, null, 'Customer-Dashboard');
        ComponentRouterService.getInstance().prepareBreadcrumbDetails(breadcrumbDetails);
    }

}

module.exports = CustomersComponent;
