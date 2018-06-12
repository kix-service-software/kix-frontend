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
        ).catch((error) => {
            this.state.error = error;
        });

        if (customers && customers.length) {
            this.state.customer = customers[0];
        }
    }

}

module.exports = CustomerInfoComponent;
