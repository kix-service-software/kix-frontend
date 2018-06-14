import { ContextService } from "@kix/core/dist/browser/context";
import { Customer, KIXObjectType, ContextMode } from "@kix/core/dist/model";
import { CustomerInfoComponentState } from "./CustomerInfoComponentState";

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
            const customers = await ContextService.getInstance().loadObjects<Customer>(
                KIXObjectType.CUSTOMER, [this.state.customerId], ContextMode.DETAILS, null
            ).catch((error) => {
                this.state.error = error;
            });

            if (customers && customers.length) {
                this.state.customer = customers[0];
            }
        }
    }

}

module.exports = CustomerInfoComponent;
