import { CustomerInfoComponentState } from './CustomerInfoComponentState';
import { ContextService } from "@kix/core/dist/browser/context";

export class CustomerInfoComponent {

    private state: CustomerInfoComponentState;

    public onCreate(input: any): void {
        this.state = new CustomerInfoComponentState();
    }

    public onInput(input: any): void {
        this.state.customer = input.customer;
        this.state.customerAttributeValueMap = this.state.customer.getCustomerInfoValues();
    }

    private getGroups(): string[] {
        const groups = [];
        this.state.customerAttributeValueMap.forEach((attrMap, group) => {
            groups.push(group);
        });
        return groups;
    }

    private getAttributes(group: string): Array<[string, string]> {
        const attributes = [];
        this.state.customerAttributeValueMap.get(group).forEach((value, label) => {
            attributes.push([label, value]);
        });
        return attributes;
    }
}

module.exports = CustomerInfoComponent;
