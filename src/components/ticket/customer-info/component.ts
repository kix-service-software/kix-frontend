import { CustomerInfoComponentState } from './CustomerInfoComponentState';
import { ContextService } from "@kix/core/dist/browser/context";

export class CustomerInfoComponent {

    private state: CustomerInfoComponentState;

    public onCreate(input: any): void {
        this.state = new CustomerInfoComponentState();
    }

    public onInput(input: any): void {
        this.state.customer = input.customer;
    }
}

module.exports = CustomerInfoComponent;
