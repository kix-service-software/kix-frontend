import { Customer, KIXObjectType } from "@kix/core/dist/model";
import { KIXObjectService } from "@kix/core/dist/browser";
import { ComponentState } from './ComponentState';

class CustomerInfoComponent {

    private state: ComponentState;

    public onCreate(input: any): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.customerId = input.customerId;
        this.state.groups = input.groups;
        this.loadCustomer();
    }

    public onMount(): void {
        this.loadCustomer();
    }

    private async loadCustomer(): Promise<void> {
        this.state.error = null;
        this.state.customer = null;

        if (this.state.customerId) {
            const customers = await KIXObjectService.loadObjects<Customer>(
                KIXObjectType.CUSTOMER, [this.state.customerId]
            ).catch((error) => {
                this.state.error = error;
            });

            if (customers && customers.length) {
                this.state.customer = customers[0];
                this.state.info = this.state.customer.getCustomerInfoData();
                if (this.state.groups && this.state.groups.length) {
                    this.state.info = this.state.info.filter(
                        (g) => this.state.groups.some((group) => group === g[0])
                    );
                }
            }
        }
    }

}

module.exports = CustomerInfoComponent;
