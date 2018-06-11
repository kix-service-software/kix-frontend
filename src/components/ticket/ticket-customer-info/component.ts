import { TicketService } from "@kix/core/dist/browser/ticket/";
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
    }

    public async onMount(): Promise<void> {
        const customers = await ContextService.getInstance().loadObjects<Customer>(
            KIXObjectType.CUSTOMER, [this.state.customerId], ContextMode.DETAILS, null
        );
        if (customers && customers.length) {
            this.state.customer = customers[0];
        }
    }

    private customerChanged(customer: Customer): boolean {
        let changed = true;

        if (this.state.customer && customer) {
            changed = !this.state.customer.equals(customer);
        } else {
            changed = true;
        }

        return changed;
    }

}

module.exports = CustomerInfoComponent;
