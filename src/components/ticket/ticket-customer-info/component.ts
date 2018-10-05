import { ContextService } from "@kix/core/dist/browser/context";
import { Customer, KIXObjectType, ContextMode } from "@kix/core/dist/model";
import { CustomerInfoComponentState } from "./CustomerInfoComponentState";
import { KIXObjectService } from "@kix/core/dist/browser";

class CustomerInfoComponent {

    private state: CustomerInfoComponentState;

    public onCreate(input: any): void {
        this.state = new CustomerInfoComponentState();
    }

    public onInput(input: any): void {
        this.state.customerId = input.customerId;
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
                this.state.info = this.state.customer.getCustomerInfoData().filter((g) => g[0] !== 'UNKNOWN');
            }
        }
    }

}

module.exports = CustomerInfoComponent;
