import { CustomerInfoComponentState } from './CustomerInfoComponentState';
import { ContextService } from "@kix/core/dist/browser/context";

export class CustomerInfoComponent {

    private state: CustomerInfoComponentState;

    public onCreate(input: any): void {
        this.state = new CustomerInfoComponentState();
    }

    public onInput(input: any): void {
        if (this.customerChanged(input)) {
            this.state.customer = input.customer;
        }
    }

    private customerChanged(input: any): boolean {
        let changed = true;

        if (this.state.customer) {
            changed = this.state.customer.equals(input.customer);
        }

        return changed;
    }
}

module.exports = CustomerInfoComponent;
