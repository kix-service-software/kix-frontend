import { TicketInputTypeComponentState } from "./TicketInputTypeComponentState";
import { ContextService } from "@kix/core/dist/browser/context";
import { FormDropdownItem, ObjectIcon, TicketProperty } from "@kix/core/dist/model";
import { CustomerService } from "@kix/core/dist/browser/customer";

class TicketInputTypeComponent {

    private state: TicketInputTypeComponentState;

    public onCreate(): void {
        this.state = new TicketInputTypeComponentState();
    }

    public onInput(input): void {
        this.state.field = input.field;
    }

    public onMount(): void {
        this.loadCustomers();
    }

    private async loadCustomers(): Promise<void> {
        const customers = await CustomerService.getInstance().loadContacts([]);
        this.state.items = customers.map(
            (c) => new FormDropdownItem(c.CustomerID, 'kix-icon-man-house', c.CustomerCompanyName)
        );
    }

}

module.exports = TicketInputTypeComponent;
