import { TicketService } from "@kix/core/dist/browser/ticket/";
import { ContextService } from "@kix/core/dist/browser/context";
import { Customer, KIXObjectType } from "@kix/core/dist/model";
import { CustomerInfoComponentState } from "./CustomerInfoComponentState";

class CustomerInfoComponent {

    private state: CustomerInfoComponentState;

    public onCreate(input: any): void {
        this.state = new CustomerInfoComponentState();
    }

    public onInput(input: any): void {
        this.state.contextType = input.contextType;
    }

    public onMount(): void {
        const context = ContextService.getInstance().getContext(this.state.contextType);
        context.registerListener({
            objectChanged: (objectId: string | number, customer: Customer) => {
                if (customer instanceof Customer && this.customerChanged(customer)) {
                    this.state.customer = customer;
                }
            },
            sidebarToggled: () => { return; },
            explorerBarToggled: () => { return; }
        });

        this.state.customer = context.getObjectByType<Customer>(KIXObjectType.CUSTOMER);
    }

    private customerChanged(customer: Customer): boolean {
        let changed = true;

        if (this.state.customer) {
            changed = !this.state.customer.equals(customer);
        }

        return changed;
    }

}

module.exports = CustomerInfoComponent;
